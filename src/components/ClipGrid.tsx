"use client";

import { Job, JobClip } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

interface ClipGridProps {
  job: Job;
}

export default function ClipGrid({ job }: ClipGridProps) {
  const doneClips = job.clips.filter((c) => c.status === "done");

  if (doneClips.length === 0) return null;

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {doneClips.length} clips ready
          </h2>
          <p className="text-gray-400">
            Vertical 9:16 — optimized for TikTok, Reels &amp; Shorts
          </p>
        </div>
        <Link href="/" className="btn-secondary">
          + New Project
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {job.clips.map((clip, i) => (
          <div key={clip.id} className={`animate-slide-up stagger-${Math.min(i + 1, 5)}`} style={{ animationFillMode: "both" }}>
            <ClipCard clip={clip} jobId={job.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

function ClipCard({ clip, jobId }: { clip: JobClip; jobId: string }) {
  const [copied, setCopied] = useState<"caption" | "hashtags" | null>(null);
  const duration = Math.round(clip.end - clip.start);
  const videoUrl = clip.filename ? `/api/clips/${jobId}/${clip.filename}` : null;
  const thumbUrl = clip.thumbnail ? `/api/clips/${jobId}/${clip.thumbnail}` : null;
  const hashtags = clip.hashtags?.length ? clip.hashtags : ["#viral", "#shorts", "#reels", "#fyp"];
  const hashtagStr = hashtags.join(" ");

  async function copyCaption() {
    const text = `${clip.title}\n\n${clip.description || ""}\n\n${hashtagStr}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied("caption");
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  async function copyHashtags() {
    try {
      await navigator.clipboard.writeText(hashtagStr);
      setCopied("hashtags");
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="relative aspect-[9/16] max-h-80 bg-dark-700">
        {clip.status === "done" && videoUrl ? (
          <video
            src={videoUrl}
            poster={thumbUrl || undefined}
            controls
            className="h-full w-full object-cover"
            preload="metadata"
          />
        ) : clip.status === "pending" ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
              <p className="text-sm text-gray-400">Rendering...</p>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-red-400">Failed</div>
        )}

        {/* Score circle */}
        {clip.score > 0 && (
          <div className="absolute right-2 top-2">
            <div className="relative flex h-10 w-10 items-center justify-center">
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none"
                  stroke={clip.score >= 80 ? "#4ade80" : clip.score >= 60 ? "#fbbf24" : "#f87171"}
                  strokeWidth="3"
                  strokeDasharray={`${(clip.score / 100) * 94.2} 94.2`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="relative z-10 text-xs font-bold">{clip.score}</span>
            </div>
          </div>
        )}

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-0.5 text-xs font-medium">
          {duration}s
        </div>
      </div>

      <div className="p-4">
        <h3 className="mb-1 font-semibold line-clamp-2">{clip.title}</h3>
        {clip.description && (
          <p className="mb-2 text-sm text-gray-300 line-clamp-2">{clip.description}</p>
        )}
        <p className="mb-2 text-xs text-gray-500 italic">{clip.reason}</p>

        {/* Hashtags */}
        <div className="mb-3 flex flex-wrap gap-1">
          {hashtags.map((tag) => (
            <span key={tag} className="rounded bg-brand-500/10 px-2 py-0.5 text-xs text-brand-400">
              {tag}
            </span>
          ))}
          <button
            onClick={copyHashtags}
            className="rounded bg-white/5 px-2 py-0.5 text-xs text-gray-400 transition hover:bg-white/10 hover:text-white"
          >
            {copied === "hashtags" ? "✓" : "📋"}
          </button>
        </div>

        <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
          <span>{formatTime(clip.start)} — {formatTime(clip.end)}</span>
        </div>

        {clip.status === "done" && videoUrl && (
          <div className="flex gap-2">
            <a
              href={`${videoUrl}?download=1`}
              className="btn-primary flex-1 py-2 text-sm"
              download
            >
              ⬇ Download
            </a>
            <button
              onClick={copyCaption}
              className="btn-secondary flex-1 py-2 text-sm"
            >
              {copied === "caption" ? "✓ Copied!" : "📋 Copy Post"}
            </button>
            <Link
              href={`/editor/${jobId}/${clip.id}`}
              className="btn-secondary px-3 py-2 text-sm"
            >
              ✂️
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
