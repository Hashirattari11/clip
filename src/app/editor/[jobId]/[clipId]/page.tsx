"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Job, JobClip } from "@/lib/types";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  const clipId = params.clipId as string;

  const [job, setJob] = useState<Job | null>(null);
  const [clip, setClip] = useState<JobClip | null>(null);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/jobs/${jobId}`)
      .then((r) => r.json())
      .then((data: Job) => {
        setJob(data);
        const c = data.clips.find((cl) => cl.id === clipId);
        if (c) {
          setClip(c);
          setStart(c.start);
          setEnd(c.end);
        }
      });
  }, [jobId, clipId]);

  async function handleSave() {
    if (!clip) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/edit/${jobId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clipId: clip.id,
          start,
          end,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      router.push(`/project/${jobId}`);
    } catch {
      alert("Failed to save edits");
    } finally {
      setSaving(false);
    }
  }

  if (!clip || !job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const videoUrl = clip.filename
    ? `/api/clips/${jobId}/${clip.filename}`
    : null;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/project/${jobId}`}
          className="mb-6 inline-block text-sm text-gray-400 hover:text-white"
        >
          ← Back to clips
        </Link>

        <h1 className="mb-2 text-2xl font-bold">Edit Clip</h1>
        <p className="mb-2 text-gray-400">{clip.title}</p>
        {clip.description && (
          <p className="mb-8 text-sm text-gray-500">{clip.description}</p>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          {/* Preview */}
          <div>
            {videoUrl && (
              <video
                src={videoUrl}
                controls
                className="w-full rounded-xl"
              />
            )}
          </div>

          {/* Controls */}
          <div className="glass-card p-6">
            <h3 className="mb-4 font-semibold">Trim Settings</h3>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400">
                Start (seconds): {start.toFixed(1)}
              </label>
              <input
                type="range"
                min={0}
                max={job.duration}
                step={0.5}
                value={start}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setStart(val);
                  if (val >= end) setEnd(val + 5);
                }}
                className="w-full accent-brand-500"
              />
            </div>

            <div className="mb-4">
              <label className="mb-1 block text-sm text-gray-400">
                End (seconds): {end.toFixed(1)}
              </label>
              <input
                type="range"
                min={0}
                max={job.duration}
                step={0.5}
                value={end}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEnd(val);
                  if (val <= start) setStart(val - 5);
                }}
                className="w-full accent-brand-500"
              />
            </div>

            <div className="mb-6 rounded-lg bg-dark-700 p-3 text-sm">
              <span className="text-gray-400">Duration: </span>
              <span className="font-medium">{(end - start).toFixed(1)}s</span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex-1"
              >
                {saving ? "Rendering..." : "Save & Re-render"}
              </button>
              <a
                href={videoUrl ? `${videoUrl}?download=1` : "#"}
                className="btn-secondary"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
