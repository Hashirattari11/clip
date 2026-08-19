import fs from "fs";
import path from "path";
import { getDeps, runCommand, findFile, parseVTT, mergeSegments } from "./utils";
import { getJobDir, getCachedVideoPath, cacheVideoPath, getCachedTranscriptPath, cacheTranscriptPath } from "./storage";
import { TranscriptSegment, VideoInfo } from "./types";
import { hasTranscriptionProvider, transcribeWithProvider, ApiKeyConfig } from "./ai-provider";

function getSettingsBrowser(): string {
  try {
    const settingsFile = path.join(process.cwd(), "data", "settings.json");
    if (fs.existsSync(settingsFile)) {
      const settings = JSON.parse(fs.readFileSync(settingsFile, "utf-8"));
      return settings.browser || "chrome";
    }
  } catch {}
  return "chrome";
}

function getBrowser(config?: ApiKeyConfig): string {
  if (config?.browser) return config.browser;
  if (config?.userId) {
    try {
      const userFile = path.join(process.cwd(), "data", "users", `${config.userId}.json`);
      if (fs.existsSync(userFile)) {
        const user = JSON.parse(fs.readFileSync(userFile, "utf-8"));
        if (user.browser) return user.browser;
      }
    } catch {}
  }
  return getSettingsBrowser();
}

function getCookieArgs(config?: ApiKeyConfig): string[] {
  const browser = getBrowser(config);
  if (browser === "none") return [];
  return ["--cookies-from-browser", browser];
}

// Common yt-dlp args to bypass YouTube restrictions
const COMMON_EXTRA_ARGS = [
  "--remote-components", "ejs:github",
  "--extractor-args", "youtube:player_client=mweb",
  // Disable impersonation since curl_cffi target isn't available
  "--no-check-certificates",
  // Add small delay between requests to avoid 429
  "--sleep-requests", "1",
];

/**
 * Run yt-dlp with cookies + remote components, retry with fallbacks on failure
 */
async function runYtdlp(
  ytdlpPath: string,
  args: string[],
  config?: ApiKeyConfig,
  timeout = 600000
): Promise<string> {
  const cookieArgs = getCookieArgs(config);

  // Attempt 1: cookies + extra args
  if (cookieArgs.length > 0) {
    try {
      return await runCommand(ytdlpPath, [...args, ...COMMON_EXTRA_ARGS, ...cookieArgs], timeout);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (
        msg.includes("cookie") ||
        msg.includes("Cookie") ||
        msg.includes("Could not copy") ||
        msg.includes("unable to find browser")
      ) {
        console.log("[yt-dlp] Cookie failed, retrying without cookies...");
      } else if (msg.includes("403") || msg.includes("429")) {
        console.log("[yt-dlp] Download blocked, retrying without cookies...");
      } else {
        throw err;
      }
    }
  }

  // Attempt 2: extra args only (no cookies)
  try {
    return await runCommand(ytdlpPath, [...args, ...COMMON_EXTRA_ARGS], timeout);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("403") || msg.includes("429")) {
      console.log("[yt-dlp] Still blocked, trying bare minimum...");
    } else {
      throw err;
    }
  }

  // Attempt 3: bare minimum (no extra args)
  return await runCommand(ytdlpPath, args, timeout);
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getVideoInfo(url: string, config?: ApiKeyConfig): Promise<VideoInfo> {
  const deps = await getDeps();
  if (!deps.ytdlp) throw new Error("yt-dlp not installed. Run: pip install yt-dlp");

  const output = await runYtdlp(deps.ytdlpPath, [
    "--dump-json",
    "--no-download",
    url,
  ], config);

  const info = JSON.parse(output);
  return {
    title: info.title || "Untitled Video",
    thumbnail: info.thumbnail || "",
    duration: info.duration || 0,
  };
}

export async function downloadVideo(url: string, jobId: string, config?: ApiKeyConfig): Promise<string> {
  // Check cache first — skip download if video already exists
  const cachedPath = getCachedVideoPath(url);
  if (cachedPath) {
    console.log(`[yt-dlp] Cache hit! Reusing video from: ${cachedPath}`);
    return cachedPath;
  }

  const deps = await getDeps();
  const jobDir = getJobDir(jobId);
  const outputTemplate = path.join(jobDir, "video.%(ext)s");

  // If AI transcription available, skip subtitle download entirely (saves 30+ seconds)
  const hasAI = hasTranscriptionProvider(config);

  if (hasAI) {
    console.log("[yt-dlp] AI available — fast download (480p, concurrent fragments)...");
    await runYtdlp(deps.ytdlpPath, [
      "-f",
      "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "--concurrent-fragments", "4",
      "-o",
      outputTemplate,
      "--no-playlist",
      url,
    ], config);
  } else {
    // No AI — must get YouTube subtitles
    await runYtdlp(deps.ytdlpPath, [
      "-f",
      "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "--concurrent-fragments", "4",
      "-o",
      outputTemplate,
      "--no-playlist",
      "--write-auto-sub",
      "--write-sub",
      "--sub-lang",
      "en",
      "--convert-subs",
      "vtt",
      "--sub-format",
      "vtt",
      url,
    ], config);

    // Also try downloading subs separately after delay (handles 429)
    await sleep(1000);
    try {
      await runYtdlp(deps.ytdlpPath, [
        "--write-auto-sub",
        "--write-sub",
        "--sub-lang",
        "en",
        "--convert-subs",
        "vtt",
        "--sub-format",
        "vtt",
        "--skip-download",
        "-o",
        outputTemplate,
        url,
      ], config);
    } catch (subErr) {
      console.log(`[yt-dlp] Separate subtitle download failed (non-fatal): ${subErr}`);
    }
  }

  const videoPath = findFile(jobDir, /\.mp4$/i);
  if (!videoPath) throw new Error("Video download failed");

  // Cache the video path for future reprocessing
  cacheVideoPath(url, videoPath);

  return videoPath;
}

export async function getTranscript(
  jobId: string,
  videoPath: string,
  config?: ApiKeyConfig
): Promise<TranscriptSegment[]> {
  const jobDir = getJobDir(jobId);

  // Try downloaded VTT subtitles first
  const vttPath = findFile(jobDir, /\.vtt$/i);
  if (vttPath) {
    try {
      const vtt = fs.readFileSync(vttPath, "utf-8");
      const segments = mergeSegments(parseVTT(vtt));
      if (segments.length > 0) {
        console.log(`[transcript] Got ${segments.length} segments from VTT file`);
        return segments;
      }
    } catch (e) {
      console.log(`[transcript] Failed to parse VTT: ${e}`);
    }
  }

  // Fallback: Gemini or OpenAI transcription (audio → text via AI)
  if (hasTranscriptionProvider(config)) {
    console.log("[transcript] No VTT found, falling back to AI transcription...");
    return await transcribeVideoAudio(videoPath, config);
  }

  // Last resort: try one more time with yt-dlp subtitles
  console.log("[transcript] Trying one more subtitle download attempt...");
  const deps = await getDeps();
  try {
    await sleep(5000);
    await runYtdlp(deps.ytdlpPath, [
      "--write-auto-sub",
      "--sub-lang",
      "en",
      "--convert-subs",
      "vtt",
      "--skip-download",
      "-o",
      path.join(jobDir, "video.%(ext)s"),
      videoPath,
    ], config);

    const vtt2 = findFile(jobDir, /\.vtt$/i);
    if (vtt2) {
      const segments = mergeSegments(parseVTT(fs.readFileSync(vtt2, "utf-8")));
      if (segments.length > 0) {
        console.log(`[transcript] Got ${segments.length} segments from retry VTT`);
        return segments;
      }
    }
  } catch (retryErr) {
    console.log(`[transcript] Retry subtitle download also failed: ${retryErr}`);
  }

  throw new Error(
    "No transcript found. Please set your Gemini/OpenAI API key for AI transcription, or ensure the video has English captions."
  );
}

async function transcribeVideoAudio(videoPath: string, config?: ApiKeyConfig): Promise<TranscriptSegment[]> {
  const audioPath = videoPath.replace(/\.mp4$/i, ".mp3");
  const deps = await getDeps();

  console.log("[transcript] Extracting audio for AI transcription...");
  await runCommand(deps.ffmpegPath, [
    "-i",
    videoPath,
    "-vn",
    "-acodec",
    "libmp3lame",
    "-q:a",
    "4",
    audioPath,
  ]);

  return transcribeWithProvider(audioPath, config);
}

export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^https?:\/\/youtu\.be\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/shorts\/[\w-]+/,
    /^https?:\/\/(www\.)?youtube\.com\/live\/[\w-]+/,
  ];
  return patterns.some((p) => p.test(url.trim()));
}
