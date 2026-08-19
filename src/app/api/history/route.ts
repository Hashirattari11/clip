import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { listJobs } from "@/lib/storage";

/**
 * GET /api/history — returns all past jobs (Supabase if configured, else local)
 * POST /api/history — save a job to Supabase
 */
export async function GET() {
  // Try Supabase first
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return NextResponse.json({ jobs: data || [], source: "supabase" });
    } catch (err) {
      console.log("[history] Supabase fetch failed, falling back to local:", err);
    }
  }

  // Fallback: local storage
  const jobs = listJobs();
  return NextResponse.json({ jobs, source: "local" });
}

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ success: true, source: "local" });
  }

  try {
    const job = await req.json();
    const { error } = await supabase.from("jobs").upsert({
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
      user_id: job.userId || null,
    }, { onConflict: "id" });

    if (error) throw error;
    return NextResponse.json({ success: true, source: "supabase" });
  } catch (err) {
    console.log("[history] Supabase save failed:", err);
    return NextResponse.json({ success: true, source: "local" });
  }
}
