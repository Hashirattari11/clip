"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useState } from "react";

const PACKS = [
  { credits: 10, price: "Free", priceNum: 0, popular: false, desc: "Try it out" },
  { credits: 50, price: "$2.99", priceNum: 2.99, popular: false, desc: "For casual creators" },
  { credits: 200, price: "$7.99", priceNum: 7.99, popular: true, desc: "Best value" },
  { credits: 500, price: "$14.99", priceNum: 14.99, popular: false, desc: "For power users" },
];

export default function CreditsPage() {
  const { user, refreshCredits } = useAuth();
  const [buying, setBuying] = useState<number | null>(null);
  const [msg, setMsg] = useState("");

  async function buyCredits(amount: number) {
    setBuying(amount);
    setMsg("");
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`+${amount} credits added! Total: ${data.credits}`);
        await refreshCredits();
      } else {
        setMsg(data.error || "Failed to add credits");
      }
    } catch {
      setMsg("Network error");
    }
    setBuying(null);
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <Link href="/" className="mb-6 inline-block text-sm text-gray-400 hover:text-white">← Home</Link>
          <h1 className="mb-4 text-3xl font-bold">Credits</h1>
          <p className="mb-6 text-gray-400">Please login to view and manage your credits</p>
          <Link href="/auth" className="btn-primary">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 hover:text-white transition-colors">
          ← Dashboard
        </Link>

        {/* Current balance */}
        <div className="glass-card mb-8 p-8 text-center ring-1 ring-brand-500/20">
          <div className="mb-2 text-sm font-medium text-gray-400">Your Credits</div>
          <div className="mb-2 text-6xl font-bold text-brand-400">{user?.credits ?? 0}</div>
          <div className="text-sm text-gray-500">credits remaining</div>
          <p className="mt-4 text-xs text-gray-500">1 credit = 1 video processed. Cached videos cost 0 credits.</p>
        </div>

        {msg && (
          <div className={`mb-6 rounded-xl p-4 text-center text-sm font-medium ${msg.includes("added") ? "bg-brand-500/10 text-brand-400" : "bg-red-500/10 text-red-400"}`}>
            {msg}
          </div>
        )}

        {/* Credit packs */}
        <h2 className="mb-6 text-2xl font-bold">Get More Credits</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {PACKS.map((pack) => (
            <div key={pack.credits} className={`glass-card relative p-6 ${pack.popular ? "ring-2 ring-brand-500/50" : ""}`}>
              {pack.popular && (
                <div className="absolute -right-3 -top-3 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold text-white">POPULAR</div>
              )}
              <div className="mb-1 text-3xl font-bold">{pack.credits} <span className="text-lg text-gray-400">credits</span></div>
              <div className="mb-4 text-sm text-gray-400">{pack.desc}</div>
              <div className="mb-4 text-2xl font-bold">{pack.price}</div>
              <button
                onClick={() => buyCredits(pack.credits)}
                disabled={buying === pack.credits}
                className={`w-full ${pack.popular ? "btn-primary" : "btn-secondary"}`}
              >
                {buying === pack.credits ? "Adding..." : pack.priceNum === 0 ? "Get Free Credits" : `Buy ${pack.credits} Credits`}
              </button>
            </div>
          ))}
        </div>

        {/* Info */}
        <div className="mt-12 glass-card p-6">
          <h3 className="mb-3 font-bold">How Credits Work</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-start gap-2"><span className="text-brand-400">•</span> 1 credit is deducted when you process a video</li>
            <li className="flex items-start gap-2"><span className="text-brand-400">•</span> Reprocessing a cached video costs 0 credits</li>
            <li className="flex items-start gap-2"><span className="text-brand-400">•</span> Credits never expire</li>
            <li className="flex items-start gap-2"><span className="text-brand-400">•</span> New accounts get 100 free credits</li>
            <li className="flex items-start gap-2"><span className="text-brand-400">•</span> You get credit back if processing fails</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
