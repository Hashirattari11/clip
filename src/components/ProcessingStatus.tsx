"use client";

import { Job } from "@/lib/types";

interface ProcessingStatusProps {
  job: Job;
}

const STEPS = [
  { key: "downloading", label: "Download", icon: "⬇️", desc: "Fetching video from YouTube" },
  { key: "transcribing", label: "Transcript", icon: "📝", desc: "Extracting speech text" },
  { key: "analyzing", label: "AI Analysis", icon: "🧠", desc: "Finding viral moments" },
  { key: "clipping", label: "Render Clips", icon: "🎬", desc: "Generating vertical clips" },
  { key: "done", label: "Done", icon: "✅", desc: "All clips ready!" },
];

const STATUS_ORDER = ["queued", "downloading", "transcribing", "analyzing", "clipping", "done"];

export default function ProcessingStatus({ job }: ProcessingStatusProps) {
  const currentIdx = STATUS_ORDER.indexOf(job.status);
  const isActive = job.status !== "done" && job.status !== "error";

  return (
    <div className="glass-card p-8 animate-scale-in">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        {job.thumbnail ? (
          <img src={job.thumbnail} alt="" className="h-16 w-28 rounded-lg object-cover" />
        ) : (
          <div className="flex h-16 w-28 items-center justify-center rounded-lg bg-dark-600 text-2xl">🎬</div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold line-clamp-1">{job.title}</h2>
          <p className="text-sm text-gray-400">{job.message}</p>
        </div>
        {isActive && (
          <div className="flex-shrink-0">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-400">Progress</span>
          <span className="font-medium text-brand-400">{job.progress}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-dark-600">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-600 via-brand-400 to-brand-500 transition-all duration-700 ease-out progress-bar-striped"
            style={{ width: `${Math.max(job.progress, 2)}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="grid grid-cols-5 gap-2">
        {STEPS.map((step, i) => {
          const stepIdx = STATUS_ORDER.indexOf(step.key);
          const isActive = job.status === step.key;
          const isDone = currentIdx > stepIdx || job.status === "done";

          return (
            <div
              key={step.key}
              className={`flex flex-col items-center gap-2 rounded-xl p-3 text-center transition-all duration-300 ${
                isActive
                  ? "bg-brand-500/20 ring-1 ring-brand-500 scale-105"
                  : isDone
                    ? "bg-white/5"
                    : "opacity-40"
              }`}
            >
              <span className={`text-xl ${isActive ? "animate-float" : ""}`}>{step.icon}</span>
              <span className="text-xs font-medium">{step.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
              )}
              {isDone && !isActive && (
                <span className="text-xs text-green-400">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {job.status === "error" && (
        <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 animate-slide-down">
          <div className="flex items-start gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-medium text-red-400">Processing failed</p>
              <p className="mt-1 text-sm text-red-300/70">{job.error || job.message || "An unexpected error occurred"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
