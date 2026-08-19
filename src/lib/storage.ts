import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Job } from "./types";
import { getSupabase } from "./supabase";

const DATA_DIR = path.join(process.cwd(), "data");
const CACHE_DIR = path.join(process.cwd(), "data", "cache");

function ensureDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Serverless — no file system, that's OK
  }
}

// --- Video Cache (file-based, only works on non-serverless) ---
function getCacheKey(url: string): string {
  return crypto.createHash("md5").update(url).digest("hex");
}

export function getCachedVideoPath(url: string): string | null {
  try {
    const key = getCacheKey(url);
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    if (!fs.existsSync(cacheFile)) return null;
    const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    if (data.videoPath && fs.existsSync(data.videoPath)) {
      return data.videoPath;
    }
  } catch {}
  return null;
}

export function cacheVideoPath(url: string, videoPath: string): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const key = getCacheKey(url);
    const cacheFile = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(cacheFile, JSON.stringify({ url, videoPath, cachedAt: new Date().toISOString() }));
  } catch {
    // Serverless — caching not available
  }
}

export function getCachedTranscriptPath(url: string): string | null {
  try {
    const key = getCacheKey(url);
    const cacheFile = path.join(CACHE_DIR, `${key}-transcript.json`);
    if (!fs.existsSync(cacheFile)) return null;
    const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
    return data.transcriptPath || null;
  } catch {}
  return null;
}

export function cacheTranscriptPath(url: string, transcriptPath: string): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    const key = getCacheKey(url);
    const cacheFile = path.join(CACHE_DIR, `${key}-transcript.json`);
    fs.writeFileSync(cacheFile, JSON.stringify({ url, transcriptPath, cachedAt: new Date().toISOString() }));
  } catch {}
}

// --- Job CRUD (Supabase primary, file fallback) ---

export async function saveJob(job: Job): Promise<void> {
  // Supabase primary
  if (getSupabase()) {
    const { error } = await getSupabase()!.from("jobs").upsert(
      {
        id: job.id,
        url: job.url,
        title: job.title || "",
        thumbnail: job.thumbnail || "",
        duration: job.duration || 0,
        status: job.status,
        progress: job.progress,
        message: job.message || "",
        clips: JSON.stringify(job.clips || []),
        created_at: job.createdAt,
        processing_time: job.processingTime || 0,
        user_id: job.userId || null,
      },
      { onConflict: "id" }
    );
    if (error) console.log("[storage] Supabase saveJob failed:", error.message);
  }

  // File fallback (non-serverless only)
  try {
    ensureDir();
    fs.writeFileSync(
      path.join(DATA_DIR, `${job.id}.json`),
      JSON.stringify(job, null, 2)
    );
  } catch {}
}

export async function getJob(id: string): Promise<Job | null> {
  // Try Supabase first
  if (getSupabase()) {
    const { data, error } = await getSupabase()!
      .from("jobs")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        url: data.url,
        title: data.title || "",
        thumbnail: data.thumbnail || "",
        duration: data.duration || 0,
        status: data.status,
        progress: data.progress,
        message: data.message || "",
        clips: typeof data.clips === "string" ? JSON.parse(data.clips) : (data.clips || []),
        createdAt: data.created_at,
        processingTime: data.processing_time || 0,
        userId: data.user_id || undefined,
      };
    }
  }

  // File fallback
  try {
    const file = path.join(DATA_DIR, `${id}.json`);
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf-8")) as Job;
  } catch {}
  return null;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  const job = await getJob(id);
  if (!job) return null;
  const updated = { ...job, ...updates };
  await saveJob(updated);
  return updated;
}

export async function listJobs(userId?: string): Promise<Job[]> {
  // Try Supabase first
  if (getSupabase()) {
    let query = getSupabase()!
      .from("jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return data.map((row) => ({
        id: row.id,
        url: row.url,
        title: row.title || "",
        thumbnail: row.thumbnail || "",
        duration: row.duration || 0,
        status: row.status,
        progress: row.progress,
        message: row.message || "",
        clips: typeof row.clips === "string" ? JSON.parse(row.clips) : (row.clips || []),
        createdAt: row.created_at,
        processingTime: row.processing_time || 0,
        userId: row.user_id || undefined,
      }));
    }
  }

  // File fallback
  try {
    ensureDir();
    return fs
      .readdirSync(DATA_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8")) as Job)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {}
  return [];
}

// --- Directory helpers (file-based, only work on non-serverless) ---

export function getUploadsDir(): string {
  try {
    const dir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  } catch {
    return "/tmp/uploads";
  }
}

export function getOutputDir(): string {
  try {
    const dir = path.join(process.cwd(), "output");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  } catch {
    return "/tmp/output";
  }
}

export function getJobDir(jobId: string): string {
  const dir = path.join(getUploadsDir(), jobId);
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {}
  return dir;
}

export function getJobOutputDir(jobId: string): string {
  const dir = path.join(getOutputDir(), jobId);
  try {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {}
  return dir;
}
