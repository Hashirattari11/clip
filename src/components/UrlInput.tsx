"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

interface UrlInputProps {
  large?: boolean;
}

export default function UrlInput({ large }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    // Login required
    if (!user) {
      setError("Please login first to process videos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Please login first to process videos");
        }
        if (res.status === 402) {
          throw new Error(`Out of credits! ${data.remaining ?? 0} remaining. Add more at /credits`);
        }
        throw new Error(data.error || data.details?.message || "Failed to start");
      }

      router.push(`/project/${data.jobId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div
        className={clsx(
          "flex gap-2",
          large ? "flex-col sm:flex-row" : "flex-col sm:flex-row"
        )}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={user ? "Paste YouTube link here..." : "Login to paste YouTube link..."}
          className={clsx("input-field flex-1", large && "py-4 text-lg")}
          disabled={loading || !user}
        />
        {!user ? (
          <Link href="/auth" className={clsx("btn-primary whitespace-nowrap", large && "px-8 py-4 text-lg")}>
            Login to Start
          </Link>
        ) : (
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={clsx("btn-primary whitespace-nowrap", large && "px-8 py-4 text-lg")}
          >
            {loading ? (
              <>
                <Spinner />
                Processing...
              </>
            ) : (
              <>Get clips in 1 click</>
            )}
          </button>
        )}
      </div>
      {error && (
        <div className="mt-3">
          <p className="text-sm text-red-400">{error}</p>
          {(error.includes("login") || error.includes("Login")) && (
            <Link href="/auth" className="mt-1 inline-block text-xs text-brand-400 hover:underline">
              → Login / Sign Up
            </Link>
          )}
          {error.includes("credits") && (
            <Link href="/credits" className="mt-1 inline-block text-xs text-brand-400 hover:underline">
              → Get more credits
            </Link>
          )}
        </div>
      )}
    </form>
  );
}

function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
