import { execFile } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execFileAsync = promisify(execFile);

export async function runCommand(
  cmd: string,
  args: string[],
  timeout = 600000
): Promise<string> {
  try {
    const { stdout, stderr } = await execFileAsync(cmd, args, {
      timeout,
      maxBuffer: 50 * 1024 * 1024,
      windowsHide: true,
    });
    return stdout || stderr;
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string };
    throw new Error(error.stderr || error.message || "Command failed");
  }
}

export async function checkDependencies(): Promise<{
  ytdlp: boolean;
  ffmpeg: boolean;
  ytdlpPath: string;
  ffmpegPath: string;
}> {
  const ytdlpCandidates = ["yt-dlp", "yt-dlp.exe"];
  const ffmpegCandidates = ["ffmpeg", "ffmpeg.exe"];

  let ytdlpPath = "";
  let ffmpegPath = "";

  for (const c of ytdlpCandidates) {
    try {
      await execFileAsync(c, ["--version"], { timeout: 5000, windowsHide: true });
      ytdlpPath = c;
      break;
    } catch {
      /* try next */
    }
  }

  for (const c of ffmpegCandidates) {
    try {
      await execFileAsync(c, ["-version"], { timeout: 5000, windowsHide: true });
      ffmpegPath = c;
      break;
    } catch {
      /* try next */
    }
  }

  return {
    ytdlp: !!ytdlpPath,
    ffmpeg: !!ffmpegPath,
    ytdlpPath,
    ffmpegPath,
  };
}

let cachedDeps: Awaited<ReturnType<typeof checkDependencies>> | null = null;

export async function getDeps() {
  if (!cachedDeps) cachedDeps = await checkDependencies();
  return cachedDeps;
}

export function findFile(dir: string, pattern: RegExp): string | null {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const match = files.find((f) => pattern.test(f));
  return match ? path.join(dir, match) : null;
}

export function parseVTT(vttContent: string): { start: number; end: number; text: string }[] {
  const segments: { start: number; end: number; text: string }[] = [];
  const blocks = vttContent.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    const timeLine = lines.find((l) => l.includes("-->"));
    if (!timeLine) continue;

    const [startStr, endStr] = timeLine.split("-->").map((s) => s.trim());
    const start = vttTimeToSeconds(startStr);
    const end = vttTimeToSeconds(endStr.split(" ")[0]);

    const textLines = lines.filter(
      (l) => !l.includes("-->") && !l.startsWith("WEBVTT") && !/^\d+$/.test(l.trim())
    );
    const text = textLines
      .join(" ")
      .replace(/<[^>]+>/g, "")
      .trim();

    if (text && end > start) {
      segments.push({ start, end, text });
    }
  }

  return segments;
}

function vttTimeToSeconds(time: string): number {
  const parts = time.replace(",", ".").split(":");
  if (parts.length === 3) {
    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
  }
  return parseFloat(parts[0]) * 60 + parseFloat(parts[1]);
}

export function mergeSegments(
  segments: { start: number; end: number; text: string }[],
  gapThreshold = 1.5
): { start: number; end: number; text: string }[] {
  if (segments.length === 0) return [];
  const merged: { start: number; end: number; text: string }[] = [{ ...segments[0] }];

  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = segments[i];
    if (curr.start - prev.end < gapThreshold) {
      prev.end = curr.end;
      prev.text += " " + curr.text;
    } else {
      merged.push({ ...curr });
    }
  }

  return merged;
}
