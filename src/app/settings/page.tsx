"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useApiKey } from "@/lib/api-key-context";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { user, refreshCredits } = useAuth();
  const { setShowModal } = useApiKey();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [provider, setProvider] = useState("gemini");
  const [browser, setBrowser] = useState("chrome");
  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.provider) setProvider(d.provider);
      if (d.browser) setBrowser(d.browser);
      setHasKey(d.hasKey || false);
      setMaskedKey(d.maskedKey || "");
    }).catch(() => {});
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  async function saveSettings() {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, browser }),
      });
      if (res.ok) setMsg("Settings saved!");
      else setMsg("Failed to save");
    } catch { setMsg("Network error"); }
    setSaving(false);
  }

  async function addCredits(amount: number) {
    setMsg("");
    try {
      const res = await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", amount }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(`+${amount} credits added!`);
        await refreshCredits();
      } else setMsg(data.error || "Failed");
    } catch { setMsg("Network error"); }
  }

  if (!user) {
    return (
      <div className="min-h-screen px-4 py-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-3xl font-bold">Settings</h1>
          <p className="mb-6 text-gray-400">Please login to access settings</p>
          <Link href="/auth" className="btn-primary">Login / Sign Up</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <Link href="/dashboard" className="mb-6 inline-block text-sm text-gray-400 hover:text-white transition-colors">← Dashboard</Link>
        <h1 className="mb-8 text-3xl font-bold">Settings</h1>

        {msg && (
          <div className={`mb-6 rounded-xl p-4 text-center text-sm font-medium ${msg.includes("saved") || msg.includes("added") ? "bg-brand-500/10 text-brand-400" : "bg-red-500/10 text-red-400"}`}>
            {msg}
          </div>
        )}

        {/* Credits */}
        <section className="glass-card mb-6 p-6">
          <h2 className="mb-4 text-lg font-bold">⚡ Credits</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-3xl font-bold text-brand-400">{user.credits ?? 0}</div>
              <div className="text-sm text-gray-500">credits remaining</div>
            </div>
            <Link href="/credits" className="btn-primary text-sm">Buy More</Link>
          </div>
          <div className="flex gap-2">
            <button onClick={() => addCredits(10)} className="btn-secondary text-xs px-3 py-1.5">+10 Free</button>
            <button onClick={() => addCredits(50)} className="btn-secondary text-xs px-3 py-1.5">+50 ($2.99)</button>
            <button onClick={() => addCredits(200)} className="btn-secondary text-xs px-3 py-1.5">+200 ($7.99)</button>
          </div>
        </section>

        {/* API Key */}
        <section className="glass-card mb-6 p-6">
          <h2 className="mb-4 text-lg font-bold">🔐 API Key</h2>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${hasKey ? "bg-green-400" : "bg-yellow-400"}`} />
                <span className="font-medium">{hasKey ? "Key saved" : "No key set"}</span>
              </div>
              {maskedKey && <div className="text-sm text-gray-500 mt-1 font-mono">{maskedKey}</div>}
              <div className="text-sm text-gray-500 mt-1">Provider: {provider === "gemini" ? "Google Gemini" : "OpenAI"}</div>
            </div>
            <button onClick={() => setShowModal(true)} className="btn-secondary text-sm">
              {hasKey ? "Update Key" : "Add Key"}
            </button>
          </div>
          <div className="text-xs text-gray-500">Your API key is encrypted and stored securely. It&apos;s only used for AI processing.</div>
        </section>

        {/* AI Provider */}
        <section className="glass-card mb-6 p-6">
          <h2 className="mb-4 text-lg font-bold">🧠 AI Provider</h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => setProvider("gemini")} className={`rounded-xl border p-4 text-sm text-left transition ${provider === "gemini" ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              <div className="font-bold">Google Gemini</div>
              <div className="text-xs opacity-60 mt-1">Free tier available</div>
              <div className="text-xs opacity-60">gemini-3.6-flash</div>
            </button>
            <button onClick={() => setProvider("openai")} className={`rounded-xl border p-4 text-sm text-left transition ${provider === "openai" ? "border-brand-500 bg-brand-500/10" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              <div className="font-bold">OpenAI GPT-4</div>
              <div className="text-xs opacity-60 mt-1">Pay per use</div>
              <div className="text-xs opacity-60">gpt-4o</div>
            </button>
          </div>
        </section>

        {/* Browser */}
        <section className="glass-card mb-6 p-6">
          <h2 className="mb-4 text-lg font-bold">🌐 Browser (yt-dlp cookies)</h2>
          <select value={browser} onChange={(e) => setBrowser(e.target.value)} className="input-field w-full mb-2">
            <option value="chrome">Chrome</option>
            <option value="edge">Microsoft Edge</option>
            <option value="firefox">Firefox</option>
            <option value="none">None</option>
          </select>
          <p className="text-xs text-gray-500">Used for downloading age-restricted or private videos.</p>
        </section>

        {/* Save */}
        <button onClick={saveSettings} disabled={saving} className="btn-primary w-full mb-6">
          {saving ? "Saving..." : "Save All Settings"}
        </button>

        {/* Account Info */}
        <section className="glass-card p-6">
          <h2 className="mb-4 text-lg font-bold">👤 Account</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Name</span><span>{user.name}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span>{user.email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Credits</span><span className="text-brand-400">{user.credits ?? 0}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}
