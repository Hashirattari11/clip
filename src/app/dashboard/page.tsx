"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Job } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [source, setSource] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((d) => {
        const parsed = (d.jobs || []).map((j: Job & { clips: string | unknown[] }) => ({
          ...j,
          clips: typeof j.clips === "string" ? JSON.parse(j.clips) : j.clips,
        }));
        setJobs(parsed);
        setSource(d.source || "local");
      })
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return jobs;
    return jobs.filter((j) => j.title.toLowerCase().includes(search.toLowerCase()));
  }, [jobs, search]);

  const totalClips = jobs.reduce((acc, j) => acc + (j.clips?.filter((c) => c.status === "done").length || 0), 0);
  const totalTime = jobs.reduce((acc, j) => acc + (j.duration || 0), 0);
  const totalTimeMin = Math.round(totalTime / 60);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="mb-2 inline-block text-sm text-gray-400 hover:text-white">
              ← Home
            </Link>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-400">
              Your video projects
              {source === "supabase" && (
                <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                  Cloud synced
                </span>
              )}
            </p>
          </div>
          <Link href="/" className="btn-primary">
            + New Project
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <StatCard label="Projects" value={jobs.length} icon="📁" />
          <StatCard label="Clips Generated" value={totalClips} icon="🎬" />
          <StatCard
            label="Total Time"
            value={totalTimeMin + "m"}
            icon="⏱️"
          />
          <StatCard
            label="Success Rate"
            value={
              jobs.length > 0
                ? Math.round(
                    (jobs.filter((j) => j.status === "done").length / jobs.length) * 100
                  ) + "%"
                : "—"
            }
            icon="✅"
          />
          <StatCard
            label="Credits"
            value={user?.credits ?? 0}
            icon="⚡"
            href="/credits"
          />
        </div>

        {/* Search */}
        {jobs.length > 3 && (
          <div className="mb-6">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="input-field w-full max-w-md"
            />
          </div>
        )}

        {/* Job List */}
        {filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="mb-4 text-4xl">🎬</div>
            <p className="mb-2 text-lg font-semibold">
              {jobs.length === 0 ? "No projects yet" : "No matching projects"}
            </p>
            <p className="mb-6 text-gray-400">
              {jobs.length === 0
                ? "Paste a YouTube URL to create your first viral clip"
                : "Try a different search term"}
            </p>
            {jobs.length === 0 && (
              <Link href="/" className="btn-primary">
                Create your first clip
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, href }: { label: string; value: string | number; icon: string; href?: string }) {
  const content = (
    <div className={`glass-card p-4 ${href ? "cursor-pointer transition hover:border-brand-500/30" : ""}`}>
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

function JobCard({ job }: { job: Job }) {
  const doneClips = job.clips?.filter((c) => c.status === "done") || [];

  return (
    <div className="glass-card overflow-hidden transition hover:border-brand-500/30">
      <Link href={`/project/${job.id}`} className="flex items-center gap-4 p-4">
        {job.thumbnail ? (
          <img
            src={job.thumbnail}
            alt=""
            className="h-16 w-28 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-dark-700 text-2xl">
            🎬
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold line-clamp-1">{job.title}</h3>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span>{doneClips.length} clips</span>
            <span>•</span>
            <span>{Math.round(job.duration / 60)}m video</span>
            {job.processingTime && (
              <>
                <span>•</span>
                <span>{formatProcessingTime(job.processingTime)} to process</span>
              </>
            )}
            <span>•</span>
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        <StatusBadge status={job.status} />
      </Link>

      {/* Clip download row */}
      {job.status === "done" && doneClips.length > 0 && (
        <div className="border-t border-white/5 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`/api/clips/${job.id}/download-all`}
              className="flex items-center gap-1 rounded-lg bg-brand-500/20 px-3 py-1.5 text-xs font-medium text-brand-400 transition hover:bg-brand-500/30"
              download
            >
              <span>📦</span>
              <span>Download All ({doneClips.length})</span>
            </a>
            {doneClips.slice(0, 3).map((clip) => (
              <a
                key={clip.id}
                href={`/api/clips/${job.id}/${clip.filename}?download=1`}
                className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-gray-300 transition hover:bg-brand-500/20 hover:text-brand-400"
                download
              >
                <span>⬇</span>
                <span className="line-clamp-1">{clip.title || clip.id}</span>
              </a>
            ))}
            {doneClips.length > 3 && (
              <span className="text-xs text-gray-500">+{doneClips.length - 3} more</span>
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {job.status === "error" && job.message && (
        <div className="border-t border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {job.message}
        </div>
      )}
    </div>
  );
}

function formatProcessingTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    done: "bg-green-500/20 text-green-400",
    error: "bg-red-500/20 text-red-400",
    queued: "bg-gray-500/20 text-gray-400",
    downloading: "bg-blue-500/20 text-blue-400",
    transcribing: "bg-purple-500/20 text-purple-400",
    analyzing: "bg-yellow-500/20 text-yellow-400",
    clipping: "bg-brand-500/20 text-brand-400",
  };
  const cls = styles[status] || "bg-yellow-500/20 text-yellow-400";

  return (
    <span className={`flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium capitalize ${cls}`}>
      {status === "done" && "✓ "}{status}
    </span>
  );
}
