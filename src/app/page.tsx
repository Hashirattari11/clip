"use client";

import Link from "next/link";
import UrlInput from "@/components/UrlInput";
import { useEffect, useState, useRef } from "react";
import { useApiKey } from "@/lib/api-key-context";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const [systemReady, setSystemReady] = useState<boolean | null>(null);
  const { hasApiKey, setShowModal } = useApiKey();
  const { user, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/process")
      .then((r) => r.json())
      .then((d) => setSystemReady(d.ready))
      .catch(() => setSystemReady(false));
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ─── NAV ─── */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-dark-900/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold">C</div>
            <span className="text-xl font-bold">ClipSpark</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-400 hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">Dashboard</Link>
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">
                      ⚡ {user.credits} credits
                    </span>
                    <button onClick={() => setShowModal(true)} className={`flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium transition hover:bg-white/10 ${hasApiKey ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${hasApiKey ? "bg-green-400" : "bg-yellow-400"}`} />
                      {hasApiKey ? "API Key Set" : "Set API Key"}
                    </button>
                    <span className="text-sm text-gray-400">{user.name}</span>
                    <Link href="/settings" className="text-xs text-gray-500 hover:text-white transition-colors">⚙️</Link>
                  </div>
                ) : (
                  <Link href="/auth" className="btn-primary py-2 px-4 text-sm">Login / Sign Up</Link>
                )}
              </>
            )}
          </div>
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400 hover:text-white">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="border-t border-white/5 bg-dark-900/95 backdrop-blur-xl px-4 py-4 md:hidden animate-slide-down">
            <div className="flex flex-col gap-3">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">Features</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">How It Works</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">Pricing</a>
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm text-gray-400 hover:text-white">Dashboard</Link>
              <Link href="/auth" onClick={() => setMobileMenuOpen(false)} className="btn-primary py-2 text-sm text-center">Login / Sign Up</Link>
            </div>
          </div>
        )}
      </nav>

      {/* System status */}
      {systemReady === false && (
        <div className="fixed top-[65px] z-40 w-full bg-yellow-500/10 px-4 py-2 text-center text-sm text-yellow-400">
          Install yt-dlp &amp; ffmpeg to enable processing
        </div>
      )}

      {/* ─── HERO ─── */}
      <section className="relative px-4 pb-16 pt-32 md:pt-40">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute right-1/4 top-20 h-[300px] w-[300px] rounded-full bg-emerald-500/5 blur-3xl animate-float" />
          <div className="absolute left-1/4 top-40 h-[200px] w-[200px] rounded-full bg-brand-400/5 blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-400 animate-fade-in">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
            AI-Powered Video Clipping Engine
          </div>

          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl animate-slide-up">
            Turn long videos into{" "}
            <span className="gradient-text">viral shorts</span>{" "}
            in seconds
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl animate-slide-up stagger-1" style={{ animationFillMode: "both" }}>
            Paste a YouTube link. AI finds the most engaging moments, creates
            vertical 9:16 clips with smart hashtags — ready for TikTok, Reels &amp; Shorts.
          </p>

          <div className="mx-auto max-w-2xl animate-slide-up stagger-2" style={{ animationFillMode: "both" }}>
            <UrlInput large />
          </div>

          {!user && (
            <p className="mt-4 text-sm text-gray-500 animate-fade-in stagger-3" style={{ animationFillMode: "both" }}>
              <Link href="/auth" className="text-brand-400 hover:underline">Sign up free</Link>{" "}
              to save projects &amp; get 100 free credits
            </p>
          )}

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 animate-fade-in stagger-4" style={{ animationFillMode: "both" }}>
            <span className="flex items-center gap-1.5"><span className="text-brand-400">✓</span> No credit card</span>
            <span className="flex items-center gap-1.5"><span className="text-brand-400">✓</span> Free forever</span>
            <span className="flex items-center gap-1.5"><span className="text-brand-400">✓</span> Open source</span>
            <span className="flex items-center gap-1.5"><span className="text-brand-400">✓</span> Privacy-first</span>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF / TRUSTED BAR ─── */}
      <section className="border-y border-white/5 bg-white/[0.02] px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-gray-500">Built for creators who move fast</p>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {TRUST_STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="border-t border-white/5 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Simple Process</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">How it works</h2>
            <p className="mx-auto max-w-lg text-gray-400">From YouTube URL to viral clips in three effortless steps. No editing skills required.</p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connection line */}
            <div className="absolute left-1/6 right-1/6 top-12 hidden h-px bg-gradient-to-r from-brand-500/20 via-brand-500/40 to-brand-500/20 md:block" />

            {STEPS.map((s, i) => (
              <div key={s.title} className="relative text-center animate-slide-up" style={{ animationDelay: `${i * 0.15}s`, animationFillMode: "both" }}>
                <div className="relative z-10 mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-gradient-to-br from-brand-500/20 to-brand-500/5">
                  <span className="text-4xl">{s.icon}</span>
                </div>
                <div className="mb-2 text-xs font-bold uppercase tracking-wider text-brand-400">Step {i + 1}</div>
                <h3 className="mb-2 text-lg font-bold">{s.title}</h3>
                <p className="text-sm text-gray-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="border-t border-white/5 bg-white/[0.01] px-4 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Powerful Features</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything you need to go viral</h2>
            <p className="mx-auto max-w-lg text-gray-400">Professional-grade AI tools packed into an interface anyone can use.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="glass-card group p-6 animate-slide-up" style={{ animationDelay: `${i * 0.05}s`, animationFillMode: "both" }}>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-2xl transition-colors group-hover:bg-brand-500/20">{f.icon}</div>
                <h3 className="mb-2 font-bold">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SUPPORTED PLATFORMS ─── */}
      <section className="border-t border-white/5 px-4 py-20">
        <div className="mx-auto max-w-5xl text-center">
          <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Multi-Platform</span>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Optimized for every platform</h2>
          <p className="mx-auto mb-12 max-w-lg text-gray-400">Every clip is auto-formatted to 9:16 vertical — the perfect ratio for all short-form platforms.</p>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {PLATFORMS.map((p, i) => (
              <div key={p.name} className="glass-card p-6 animate-scale-in" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                <div className="mb-3 text-4xl">{p.icon}</div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="mt-1 text-xs text-gray-500">{p.ratio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="border-t border-white/5 bg-white/[0.01] px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Use Cases</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Made for every creator</h2>
            <p className="mx-auto max-w-lg text-gray-400">Whether you&apos;re a solo creator or a media company — ClipSpark scales with you.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {USE_CASES.map((uc, i) => (
              <div key={uc.title} className="glass-card flex gap-4 p-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-3xl">{uc.icon}</div>
                <div>
                  <h3 className="mb-1 font-bold">{uc.title}</h3>
                  <p className="text-sm text-gray-400">{uc.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="border-t border-white/5 px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Before &amp; After</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">See the difference</h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Before */}
            <div className="glass-card p-6 border-red-500/20">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400">Before ClipSpark</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-red-400">✗</span> Watch entire video to find clips manually</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-red-400">✗</span> Edit in complex software (Premiere, DaVinci)</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-red-400">✗</span> Manually crop to 9:16 for each clip</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-red-400">✗</span> Research hashtags for each post</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-red-400">✗</span> 3-5 hours per video of editing work</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-red-400">✗</span> Miss viral moments because you skipped ahead</li>
              </ul>
            </div>

            {/* After */}
            <div className="glass-card p-6 border-brand-500/20 ring-1 ring-brand-500/10">
              <div className="mb-4 flex items-center gap-2">
                <span className="rounded-full bg-brand-500/20 px-3 py-1 text-xs font-medium text-brand-400">After ClipSpark</span>
              </div>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand-400">✓</span> Paste URL — AI scans entire transcript instantly</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand-400">✓</span> No editing software needed at all</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand-400">✓</span> Auto-reframed 9:16 for every clip</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand-400">✓</span> AI generates smart hashtags per clip</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand-400">✓</span> Under 2 minutes — even for hour-long videos</li>
                <li className="flex items-start gap-2"><span className="mt-0.5 text-brand-400">✓</span> Never misses a viral moment with AI scoring</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="border-t border-white/5 bg-white/[0.01] px-4 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Loved by Creators</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">What creators are saying</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="glass-card p-6 animate-slide-up" style={{ animationDelay: `${i * 0.1}s`, animationFillMode: "both" }}>
                <div className="mb-3 text-brand-400">★★★★★</div>
                <p className="mb-4 text-sm text-gray-300 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">{t.name[0]}</div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="border-t border-white/5 px-4 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">FAQ</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="glass-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold pr-4">{faq.q}</span>
                  <svg className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="border-t border-white/5 px-5 pb-5 pt-3 text-sm text-gray-400 leading-relaxed animate-slide-down">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="border-t border-white/5 bg-white/[0.01] px-4 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-400">Pricing</span>
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
            <p className="mx-auto max-w-lg text-gray-400">Use your own API keys. No subscriptions, no hidden fees, no limits.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="glass-card p-8">
              <div className="mb-2 text-sm font-medium text-brand-400">Starter</div>
              <div className="mb-4 text-4xl font-bold">Free<span className="text-lg text-gray-400">/forever</span></div>
              <p className="mb-6 text-sm text-gray-400">100 free credits when you sign up. No credit card required.</p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> 100 free credits on signup</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> AI-powered clip detection</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> 9:16 vertical formatting</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Smart hashtags generation</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Download &amp; batch download</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> 0 credits for cached videos</li>
              </ul>
              <a href="/" className="btn-secondary mt-8 w-full">Get 100 Free Credits</a>
            </div>

            <div className="glass-card relative overflow-hidden p-8 ring-2 ring-brand-500/50">
              <div className="absolute -right-8 -top-8 rotate-45 rounded-full bg-brand-500 px-10 py-1 text-xs font-bold text-white">POPULAR</div>
              <div className="mb-2 text-sm font-medium text-brand-400">Pro (BYOK)</div>
              <div className="mb-4 text-4xl font-bold">Free<span className="text-lg text-gray-400"> + API key</span></div>
              <p className="mb-6 text-sm text-gray-400">Buy credit packs for more videos, or bring your own API key</p>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Everything in Starter</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> AI transcription (any video)</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Smarter clip detection (10x better)</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Custom titles &amp; descriptions</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Credits never expire</li>
                <li className="flex items-center gap-2"><span className="text-brand-400">✓</span> Priority processing</li>
              </ul>
              <Link href="/auth" className="btn-primary mt-8 w-full">Sign Up &amp; Add Key</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="border-t border-white/5 px-4 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-500/5 blur-3xl" />
          </div>
          <div className="relative">
            <h2 className="mb-4 text-4xl font-bold md:text-5xl">Ready to go <span className="gradient-text">viral</span>?</h2>
            <p className="mb-10 text-lg text-gray-400">Start clipping. It&apos;s completely free. No signup required.</p>
            <UrlInput />
            <p className="mt-6 text-sm text-gray-500">
              Paste any YouTube link and get viral clips in under 2 minutes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── DATA ─── */

const TRUST_STATS = [
  { value: "9:16", label: "Vertical format" },
  { value: "<2 min", label: "Processing time" },
  { value: "5-8", label: "Hashtags per clip" },
  { value: "∞", label: "Clips per video" },
];

const STEPS = [
  { icon: "🔗", title: "Paste YouTube Link", desc: "Drop any YouTube URL — podcasts, vlogs, tutorials, interviews, live streams, anything." },
  { icon: "🧠", title: "AI Finds Best Moments", desc: "Gemini or OpenAI analyzes the entire transcript and scores every segment for viral potential." },
  { icon: "🚀", title: "Download &amp; Share", desc: "Get vertical 9:16 clips with smart hashtags. Download, copy captions, and post instantly." },
];

const FEATURES = [
  { icon: "🧠", title: "AI Clip Detection", desc: "Smart analysis finds hooks, emotional peaks, and viral-worthy segments automatically." },
  { icon: "📱", title: "9:16 Vertical Format", desc: "Auto-reframed for TikTok, Instagram Reels, and YouTube Shorts." },
  { icon: "🏷️", title: "Smart Hashtags", desc: "AI generates 5-8 relevant hashtags per clip — mix of broad and niche for maximum reach." },
  { icon: "⚡", title: "Fast Rendering", desc: "Parallel fragment download + ultrafast FFmpeg encoding. Under 2 minutes even for hour-long videos." },
  { icon: "☁️", title: "Cloud History", desc: "All your projects saved in the cloud with Supabase. Access anywhere, anytime." },
  { icon: "🔐", title: "Your API Keys", desc: "Use your own Gemini/OpenAI keys. We never store or share them. Privacy first." },
  { icon: "🎯", title: "Smart Scoring", desc: "Every clip scored 1-100 by AI for viral potential. Pick the best ones with confidence." },
  { icon: "📋", title: "One-Click Copy", desc: "Copy title + description + hashtags in one click. Paste directly into TikTok or Reels." },
  { icon: "💾", title: "Video Caching", desc: "Reprocess the same video instantly with intelligent caching. No re-downloading." },
  { icon: "📦", title: "Batch Download", desc: "Download all clips at once. Save hours of manual clicking." },
  { icon: "🔄", title: "Unlimited Retries", desc: "Not happy with the clips? Reprocess with different settings until they're perfect." },
  { icon: "🌐", title: "Multi-Language", desc: "Works with videos in any language — Hindi, English, Spanish, Japanese, and more." },
];

const PLATFORMS = [
  { icon: "🎵", name: "TikTok", ratio: "9:16" },
  { icon: "📸", name: "Instagram Reels", ratio: "9:16" },
  { icon: "▶️", name: "YouTube Shorts", ratio: "9:16" },
  { icon: "📌", name: "Pinterest Pins", ratio: "9:16" },
];

const USE_CASES = [
  { icon: "🎙️", title: "Podcasters", desc: "Turn hour-long episodes into 10+ viral clips with the best quotes and hot takes." },
  { icon: "🎓", title: "Educators", desc: "Extract key teaching moments and make them shareable on social media." },
  { icon: "💼", title: "Entrepreneurs", desc: "Create clips from interviews, talks, and panel discussions to build authority." },
  { icon: "📰", title: "News &amp; Media", desc: "Quickly clip breaking moments from press conferences and live streams." },
  { icon: "🎮", title: "Streamers &amp; Gamers", desc: "Find and clip the funniest, most intense moments from your streams." },
  { icon: "📈", title: "Marketing Teams", desc: "Repurpose long-form content into multiple short-form pieces for maximum reach." },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "YouTuber, 500K subs", text: "ClipSpark saved me 4 hours per video. I just paste the link and get 10+ perfect clips with hashtags. Game changer!" },
  { name: "Alex Chen", role: "Podcast Host", text: "I used to miss the best moments from my interviews. Now AI finds every viral quote I didn't even remember saying." },
  { name: "Maria Lopez", role: "Social Media Manager", text: "We manage 12 creator accounts. ClipSpark lets us produce 50+ clips per week with almost zero manual effort." },
];

const FAQS = [
  { q: "Is ClipSpark really free?", a: "Yes! ClipSpark is completely free to use. We don't charge anything. You just need your own API key (free tier available from Gemini/OpenAI) for AI-powered features." },
  { q: "Do I need an API key?", a: "For basic clip detection, no. ClipSpark can analyze videos without any API key. But for the best results — AI transcription, smarter scoring, and custom titles — we recommend adding a Gemini or OpenAI key (both have generous free tiers)." },
  { q: "How many clips can I generate?", a: "Unlimited! There's no cap on how many clips you can generate. The AI finds ALL viral moments — could be 3, 10, or 20+ clips per video depending on the content." },
  { q: "What video formats are supported?", a: "Any YouTube video — regular uploads, Shorts, live streams, podcasts, interviews, tutorials. The AI handles all languages and content types." },
  { q: "How fast is processing?", a: "Most videos are processed in under 2 minutes. Longer videos (1+ hours) may take slightly longer but the parallel processing and video caching keep things fast." },
  { q: "Is my data private?", a: "Absolutely. Your API keys are encrypted and never shared. Videos are processed locally or in your own Supabase instance. We never sell or access your content." },
  { q: "Can I customize the clips?", a: "Yes! You can adjust clip duration (15-120 seconds), change the AI model, and use the built-in editor to trim, add text overlays, and fine-tune each clip before downloading." },
  { q: "What platforms do the clips work on?", a: "All short-form platforms! TikTok, Instagram Reels, YouTube Shorts, Pinterest Pins, Facebook Reels — anywhere vertical 9:16 video works." },
];
