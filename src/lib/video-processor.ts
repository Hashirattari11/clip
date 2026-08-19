import path from "path";
import fs from "fs";
import os from "os";
import { getDeps, runCommand } from "./utils";
import { getJobOutputDir } from "./storage";
import { ClipSuggestion } from "./types";

// Max parallel ffmpeg processes (use all CPU cores)
const MAX_PARALLEL = Math.min(6, os.cpus().length || 2);

async function renderClip(
  deps: { ffmpegPath: string },
  videoPath: string,
  outputDir: string,
  clip: ClipSuggestion
): Promise<{ id: string; filename: string; thumbnail: string }> {
  const filename = `${clip.id}.mp4`;
  const thumbName = `${clip.id}.jpg`;
  const outputPath = path.join(outputDir, filename);
  const thumbPath = path.join(outputDir, thumbName);
  const duration = clip.end - clip.start;

  // Speed optimizations: ultrafast + zerolatency + all threads + yuv420p
  await runCommand(deps.ffmpegPath, [
    "-ss", clip.start.toFixed(2),
    "-i", videoPath,
    "-t", duration.toFixed(2),
    "-vf", "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-crf", "28",          // Slightly higher CRF = faster encoding (still good quality)
    "-pix_fmt", "yuv420p",
    "-threads", "0",       // Use all CPU cores
    "-c:a", "aac",
    "-b:a", "96k",         // Lower audio bitrate = faster
    "-ac", "1",            // Mono audio = faster
    "-movflags", "+faststart",
    "-y", outputPath,
  ]);

  // Generate thumbnail (fast: single frame)
  await runCommand(deps.ffmpegPath, [
    "-ss", (clip.start + duration / 2).toFixed(2),
    "-i", videoPath,
    "-vframes", "1",
    "-vf", "scale=540:960",
    "-y", thumbPath,
  ]);

  return { id: clip.id, filename, thumbnail: thumbName };
}

async function parallelMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  onProgress?: (done: number, total: number) => void
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  let done = 0;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i]);
      done++;
      onProgress?.(done, items.length);
    }
  }

  const workers = Array.from({ length: Math.min(MAX_PARALLEL, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function generateClips(
  jobId: string,
  videoPath: string,
  suggestions: ClipSuggestion[],
  onProgress?: (current: number, total: number) => void
): Promise<{ id: string; filename: string; thumbnail: string }[]> {
  const deps = await getDeps();
  if (!deps.ffmpeg) throw new Error("ffmpeg not installed");

  const outputDir = getJobOutputDir(jobId);

  console.log(`[video] Rendering ${suggestions.length} clips with ${MAX_PARALLEL} parallel workers...`);

  const results = await parallelMap(
    suggestions,
    (clip) => renderClip(deps, videoPath, outputDir, clip),
    onProgress
  );

  console.log(`[video] All ${results.length} clips rendered.`);
  return results;
}

export async function reclipWithTrim(
  jobId: string,
  videoPath: string,
  clipId: string,
  start: number,
  end: number,
): Promise<string> {
  const deps = await getDeps();
  const outputDir = getJobOutputDir(jobId);
  const filename = `${clipId}-edited.mp4`;
  const outputPath = path.join(outputDir, filename);
  const duration = end - start;

  await runCommand(deps.ffmpegPath, [
    "-ss", start.toFixed(2),
    "-i", videoPath,
    "-t", duration.toFixed(2),
    "-vf", "crop=ih*9/16:ih:(iw-ih*9/16)/2:0,scale=1080:1920:flags=lanczos",
    "-c:v", "libx264",
    "-preset", "ultrafast",
    "-tune", "zerolatency",
    "-crf", "28",
    "-pix_fmt", "yuv420p",
    "-threads", "0",
    "-c:a", "aac",
    "-b:a", "96k",
    "-ac", "1",
    "-movflags", "+faststart",
    "-y", outputPath,
  ]);

  return filename;
}
