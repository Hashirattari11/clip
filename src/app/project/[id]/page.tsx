"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Job } from "@/lib/types";
import ProcessingStatus from "@/components/ProcessingStatus";
import ClipGrid from "@/components/ClipGrid";

export default function ProjectPage() {
  const params = useParams();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  const fetchJob = useCallback(async () => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`);
      if (!res.ok) throw new Error("Job not found");
      const data = await res.json();
      setJob(data);
      return data;
    } catch {
      setError("Project not found");
      return null;
    }
  }, [jobId]);

  // Initial fetch
  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  // Poll every 1.5s while processing, stop when done/error
  useEffect(() => {
    if (!job || job.status === "done" || job.status === "error") return;
    const interval = setInterval(fetchJob, 1500);
    return () => clearInterval(interval);
  }, [job, fetchJob]);

  // Elapsed time counter
  useEffect(() => {
    if (!job || job.status === "done" || job.status === "error") return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [job, startTime]);

  function downloadAll() {
    if (!job) return;
    const doneClips = job.clips.filter((c) => c.status === "done" && c.filename);
    doneClips.forEach((clip, i) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = `/api/clips/${job.id}/${clip.filename}?download=1`;
        a.download = clip.filename;
        a.click();
      }, i * 500);
    });
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center animate-scale-in">
          <div className="mb-4 text-5xl">🔍</div>
          <p className="mb-4 text-lg text-gray-400">{error}</p>
          <Link href="/" className="btn-primary">Go Home</Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  const isProcessing = ["queued", "downloading", "transcribing", "analyzing", "clipping"].includes(job.status);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            ← Dashboard
          </Link>
          {isProcessing && elapsed > 0 && (
            <span className="text-xs text-gray-500">Elapsed: {formatElapsed(elapsed)}</span>
          )}
        </div>

        {isProcessing && (
          <div className="mb-8 animate-slide-up">
            <ProcessingStatus job={job} />
            {elapsed > 0 && (
              <p className="mt-3 text-center text-xs text-gray-500">
                Processing for {formatElapsed(elapsed)} — typically takes 1-2 minutes
              </p>
            )}
          </div>
        )}

        {job.status === "queued" && (
          <div className="mb-8 animate-slide-up">
            <ProcessingStatus job={job} />
          </div>
        )}

        {job.status === "done" && (
          <div className="mb-8 animate-slide-up">
            <div className="glass-card mb-6 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {job.thumbnail ? (
                  <img src={job.thumbnail} alt="" className="h-20 w-36 rounded-lg object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <h1 className="text-xl font-bold line-clamp-1">{job.title}</h1>
                  </div>
                  <p className="text-sm text-gray-400">
                    {job.clips.filter((c) => c.status === "done").length} clips generated
                    {job.duration > 0 && <> • {Math.round(job.duration / 60)}m video</>}
                    {job.processingTime && <> • {formatElapsed(job.processingTime)} processing</>}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={downloadAll} className="btn-secondary text-sm">
                    📦 Download All
                  </button>
                  <Link href="/" className="btn-primary text-sm">+ New</Link>
                </div>
              </div>
            </div>
            <ClipGrid job={job} />
          </div>
        )}

        {job.status === "error" && (
          <div className="animate-scale-in">
            <ProcessingStatus job={job} />
            <div className="mt-6 text-center">
              <Link href="/" className="btn-primary">Try Again</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
