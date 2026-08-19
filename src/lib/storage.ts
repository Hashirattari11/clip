import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Job } from "./types";
import { supabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_DIR = path.join(process.cwd(), "data", "cache");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// --- Video Cache ---
function getCacheKey(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex");
}

export function getCachedVideoPath(url: string): string | null {
  const key = getCacheKey(url);
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  if (!fs.existsSync(cacheFile)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    if (data.videoPath && fs.existsSync(data.videoPath)) {
      return data.videoPath;
    }
  } catch {}
  return null;
}

export function cacheVideoPath(url: string, videoPath: string): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const key = getCacheKey(url);
  const cacheFile = path.join(CACHE_DIR, `${key}.json`);
  fs.writeFileSync(cacheFile, JSON.stringify({ url, videoPath, cachedAt: new Date().toISOString() }));
}

export function getCachedTranscriptPath(url: string): string | null {
  const key = getCacheKey(url);
  const cacheFile = path.join(CACHE_DIR, `${key}-transcript.json`);
  if (!fs.existsSync(cacheFile)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    return data.transcriptPath || null;
  } catch {}
  return null;
}

export function cacheTranscriptPath(url: string, transcriptPath: string): void {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  const key = getCacheKey(url);
  const cacheFile = path.join(CACHE_DIR, `${key}-transcript.json`);
  fs.writeFileSync(cacheFile, JSON.stringify({ url, transcriptPath, cachedAt: new Date().toISOString() }));
}

export function saveJob(job: Job): void {
  ensureDir();
  fs.writeFileSync(
    path.join(DATA_DIR, `${job.id}.json`),
    JSON.stringify(job, null, 2)
  );

  // Also save to Supabase in background (non-blocking)
  if (supabase) {
    supabase.from("jobs").upsert({
      id: job.id,
      url: job.url,
      title: job.title,
      thumbnail: job.thumbnail,
      duration: job.duration,
      status: job.status,
      progress: job.progress,
      message: job.message,
      clips: JSON.stringify(job.clips || []),
      created_at: job.createdAt,
      processing_time: job.processingTime || 0,
    }, { onConflict: "id" }).then(({ error }) => {
      if (error) console.log("[storage] Supabase sync failed:", error.message);
    });
  }
}

export function getJob(id: string): Job | null {
  ensureDir();
  const file = path.join(DATA_DIR, `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf-8")) as Job;
}

export function updateJob(id: string, updates: Partial<Job>): Job | null {
  const job = getJob(id);
  if (!job) return null;
  const updated = { ...job, ...updates };
  saveJob(updated);
  return updated;
}

export function listJobs(): Job[] {
  ensureDir();
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8")) as Job)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getUploadsDir(): string {
  const dir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getOutputDir(): string {
  const dir = path.join(process.cwd(), "output");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getJobDir(jobId: string): string {
  const dir = path.join(getUploadsDir(), jobId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function getJobOutputDir(jobId: string): string {
  const dir = path.join(getOutputDir(), jobId);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}
