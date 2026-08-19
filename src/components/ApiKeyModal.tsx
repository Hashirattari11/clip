"use client";

import { useState, useEffect } from "react";
import { useApiKey } from "@/lib/api-key-context";
import { useAuth } from "@/lib/auth-context";

export default function ApiKeyModal() {
  const { showModal, setShowModal } = useApiKey();
  const { user } = useAuth();

  const [aiProvider, setAiProvider] = useState<"gemini" | "openai">("gemini");
  const [apiKey, setApiKey] = useState("");
  const [existingKey, setExistingKey] = useState("");
  const [browser, setBrowser] = useState("chrome");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  // Load user's existing settings when modal opens
  useEffect(() => {
    if (showModal && user) {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((d) => {
          if (d.provider) setAiProvider(d.provider);
          if (d.browser) setBrowser(d.browser);
          if (d.hasKey) {
            setExistingKey("••••••••••••••••");
            setApiKey(""); // Don't pre-fill for security
          }
        })
        .catch(() => {});
    }
  }, [showModal, user]);

  if (!showModal) return null;

  async function handleSave() {
    const keyToSave = apiKey.trim() || existingKey;
    if (!keyToSave || keyToSave === "••••••••••••••••") {
      // No new key entered, just update provider/browser
      if (user) {
        setLoading(true);
        try {
          await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ apiKey: "placeholder", provider: aiProvider, browser }),
          });
          setSaved(true);
          setTimeout(() => { setShowModal(false); setSaved(false); window.location.reload(); }, 800);
        } catch { alert("Failed to save"); }
        setLoading(false);
      }
      return;
    }

    if (!user) {
      localStorage.setItem("clipspark_api_key", keyToSave);
      localStorage.setItem("clipspark_ai_provider", aiProvider);
      localStorage.setItem("clipspark_browser", browser);
      setShowModal(false);
      window.location.reload();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: keyToSave, provider: aiProvider, browser }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          setShowModal(false);
          setSaved(false);
          setApiKey("");
          window.location.reload();
        }, 800);
      }
    } catch {
      alert("Failed to save. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setApiKey("");
    setExistingKey("");
    setShowKey(true);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-card w-full max-w-md p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">API Key Settings</h2>
          <button onClick={() => { setShowModal(false); setApiKey(""); }} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {!user && (
          <div className="mb-4 rounded-xl bg-yellow-500/10 p-3 text-sm text-yellow-400">
            ⚠️ Not logged in — keys saved locally only.{" "}
            <a href="/auth" className="underline hover:text-yellow-300">Sign up</a> to save permanently.
          </div>
        )}

        {saved && (
          <div className="mb-4 rounded-xl bg-green-500/10 p-3 text-center text-sm text-green-400">
            ✓ Saved to your account!
          </div>
        )}

        {/* Provider */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-300">AI Provider</label>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setAiProvider("gemini")} className={`rounded-xl border p-3 text-sm transition ${aiProvider === "gemini" ? "border-brand-500 bg-brand-500/10 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              <div className="font-medium">Google Gemini</div>
              <div className="text-xs opacity-60">Free tier available</div>
            </button>
            <button onClick={() => setAiProvider("openai")} className={`rounded-xl border p-3 text-sm transition ${aiProvider === "openai" ? "border-brand-500 bg-brand-500/10 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
              <div className="font-medium">OpenAI GPT-4</div>
              <div className="text-xs opacity-60">Pay per use</div>
            </button>
          </div>
        </div>

        {/* API Key */}
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-300">
            {aiProvider === "gemini" ? "Gemini" : "OpenAI"} API Key
          </label>
          {existingKey && !apiKey ? (
            <div className="flex items-center gap-2">
              <div className="input-field flex-1 text-gray-500">{existingKey}</div>
              <button onClick={handleClear} className="btn-secondary px-3 py-2 text-sm shrink-0">Change</button>
            </div>
          ) : (
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={aiProvider === "gemini" ? "AIza..." : "sk-..."}
                className="input-field w-full pr-10"
              />
              <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-xs">
                {showKey ? "Hide" : "Show"}
              </button>
            </div>
          )}
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>{aiProvider === "gemini" ? "Get yours at aistudio.google.com" : "Get yours at platform.openai.com"}</span>
            <span>🔒 Encrypted &amp; private</span>
          </div>
        </div>

        {/* Browser */}
        <div className="mb-6">
          <label className="mb-1 block text-sm font-medium text-gray-300">YouTube Cookie Browser</label>
          <select value={browser} onChange={(e) => setBrowser(e.target.value)} className="input-field w-full">
            <option value="chrome">Chrome</option>
            <option value="edge">Microsoft Edge</option>
            <option value="firefox">Firefox</option>
            <option value="none">None</option>
          </select>
        </div>

        <button onClick={handleSave} disabled={loading} className="btn-primary w-full">
          {loading ? "Saving..." : saved ? "✓ Saved!" : existingKey && !apiKey ? "Update Settings" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
