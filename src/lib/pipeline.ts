import { v4 as uuidv4 } from "uuid";
import { saveJob, updateJob, getJobDir } from "./storage";
import { findFile } from "./utils";
import { getVideoInfo, downloadVideo, getTranscript, isValidYouTubeUrl } from "./youtube";
import { findBestClips } from "./ai-clips";
import { generateClips } from "./video-processor";
import { Job, JobClip } from "./types";
import { ApiKeyConfig } from "./ai-provider";
import { addCredits } from "./auth";

/**
 * Convert raw errors into user-friendly messages
 */
function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  // AI errors
  if (msg.includes("API key not found") || msg.includes("API_KEY_INVALID") || msg.includes("401")) {
    return "Your API key is invalid or expired. Please update it in Settings and try again.";
  }
  if (msg.includes("quota") || msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED")) {
    return "API rate limit reached. Please wait a minute and try again, or switch to another API key.";
  }
  if (msg.includes("invalid JSON") || msg.includes("AI returned")) {
    return "AI response could not be processed. Please try again — this usually fixes itself.";
  }
  if (msg.includes("No AI provider")) {
    return "No AI provider configured. Please add your Gemini or OpenAI API key in Settings.";
  }
  if (msg.includes("model") && msg.includes("404")) {
    return "AI model not available. Please check your API key and try again.";
  }

  // YouTube errors
  if (msg.includes("Video unavailable") || msg.includes("Private video")) {
    return "This video is private or unavailable. Please try a different video.";
  }
  if (msg.includes("age-restricted")) {
    return "This video is age-restricted. Please try a public video instead.";
  }
  if (msg.includes("No video found") || msg.includes("Video download failed")) {
    return "Could not download the video. Please check the URL and try again.";
  }
  if (msg.includes("Invalid YouTube URL")) {
    return "Please enter a valid YouTube URL (e.g., youtube.com/watch?v=... or youtu.be/...).";
  }
  if (msg.includes("transcript") || msg.includes("No transcript")) {
    return "No captions found for this video. Adding your API key enables AI transcription for any video.";
  }

  // System errors
  if (msg.includes("yt-dlp not installed")) {
    return "Video downloader not installed. Please install yt-dlp and restart the app.";
  }
  if (msg.includes("ffmpeg not installed")) {
    return "Video processor not installed. Please install ffmpeg and restart the app.";
  }

  // Default — keep original if short, otherwise generic
  if (msg.length < 120) return msg;
  return "Something went wrong. Please try again or try a different video.";
}

export async function processVideo(url: string, config?: ApiKeyConfig): Promise<string> {
  if (!isValidYouTubeUrl(url)) {
    throw new Error("Please enter a valid YouTube URL (e.g., youtube.com/watch?v=... or youtu.be/...).");
  }

  const jobId = uuidv4();

  // Validate video info first (fast feedback)
  let info;
  try {
    info = await getVideoInfo(url, config);
  } catch (err) {
    throw new Error(friendlyError(err));
  }

  const job: Job = {
    id: jobId,
    url,
    title: info.title,
    thumbnail: info.thumbnail,
    duration: info.duration,
    status: "queued",
    progress: 0,
    message: "Starting...",
    clips: [],
    createdAt: new Date().toISOString(),
  };

  saveJob(job);

  // Run processing in background
  processJobAsync(jobId, config).catch((err) => {
    const message = friendlyError(err);
    console.error(`[pipeline] Job ${jobId} failed:`, err);
    updateJob(jobId, {
      status: "error",
      error: message,
      message,
    });
    // Refund credit on failure
    if (config?.userId) {
      addCredits(config.userId, 1);
      console.log(`[pipeline] Refunded 1 credit to user ${config.userId}`);
    }
  });

  return jobId;
}

async function processJobAsync(jobId: string, config?: ApiKeyConfig): Promise<void> {
  const startTime = Date.now();
  const job = await step(jobId, "downloading", 10, "Downloading video...");

  let videoPath: string;
  try {
    videoPath = await downloadVideo(job.url, jobId, config);
  } catch (err) {
    throw new Error(friendlyError(err));
  }

  await step(jobId, "transcribing", 30, "Extracting transcript...");

  let transcript;
  try {
    transcript = await getTranscript(jobId, videoPath, config);
  } catch (err) {
    throw new Error(friendlyError(err));
  }

  await step(jobId, "analyzing", 50, "AI finding best moments...");

  let suggestions;
  try {
    suggestions = await findBestClips(transcript, job.duration, job.title, config);
  } catch (err) {
    throw new Error(friendlyError(err));
  }

  const jobClips: JobClip[] = suggestions.map((s) => ({
    ...s,
    filename: "",
    status: "pending" as const,
  }));

  updateJob(jobId, { clips: jobClips });

  await step(jobId, "clipping", 60, "Generating clips...");

  const results = await generateClips(jobId, videoPath, suggestions, (current, total) => {
    const progress = 60 + Math.floor((current / total) * 35);
    updateJob(jobId, {
      progress,
      message: `Rendering clip ${current}/${total}...`,
    });
  });

  const finalClips = jobClips.map((clip) => {
    const result = results.find((r) => r.id === clip.id);
    return {
      ...clip,
      filename: result?.filename || "",
      thumbnail: result?.thumbnail || "",
      status: result ? ("done" as const) : ("error" as const),
    };
  });

  updateJob(jobId, {
    status: "done",
    progress: 100,
    message: "All clips ready!",
    clips: finalClips,
    processingTime: Math.round((Date.now() - startTime) / 1000),
  });
}

async function step(
  jobId: string,
  status: Job["status"],
  progress: number,
  message: string
): Promise<Job> {
  const job = updateJob(jobId, { status, progress, message });
  if (!job) throw new Error("Job not found");
  return job;
}

export function getVideoPathForJob(jobId: string): string | null {
  const jobDir = getJobDir(jobId);
  return findFile(jobDir, /\.mp4$/i);
}
