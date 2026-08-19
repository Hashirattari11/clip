import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — ClipSpark",
  description: "Learn about ClipSpark — the AI-powered tool that turns long videos into viral short clips.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-block text-sm text-gray-400 hover:text-white transition-colors">
          ← Home
        </Link>

        <h1 className="mb-6 text-3xl font-bold">About ClipSpark</h1>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section className="glass-card p-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Our Mission</h2>
            <p className="text-lg">
              We believe every creator deserves access to professional video editing — without the steep learning curve,
              expensive software, or hours of manual work.
            </p>
            <p className="mt-4">
              ClipSpark uses AI to automatically find the most engaging moments in any YouTube video and
              turns them into vertical, share-ready clips for TikTok, Instagram Reels, and YouTube Shorts.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">How It Started</h2>
            <p>
              Creating short-form content is one of the most effective ways to grow on social media.
              But manually watching hours of footage to find the perfect moments is tedious and time-consuming.
              We built ClipSpark to solve this problem — let AI do the heavy lifting while you focus on creating.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">What We Offer</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { title: "AI Clip Detection", desc: "Smart analysis finds hooks, emotional peaks, and viral-worthy segments automatically." },
                { title: "Vertical Formatting", desc: "Auto-reframed 9:16 clips optimized for mobile-first platforms." },
                { title: "Cloud History", desc: "All your projects saved in the cloud. Access from anywhere, anytime." },
                { title: "Bring Your Own Key", desc: "Use your own Gemini or OpenAI API keys. Your data stays yours." },
              ].map((item) => (
                <div key={item.title} className="glass-card p-4">
                  <h3 className="mb-1 font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Privacy First</h2>
            <p>
              We take privacy seriously. We never sell your data. Your API keys are encrypted and never shared.
              Video content is stored temporarily and can be deleted at any time. We only collect the minimum
              data needed to provide the Service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-semibold text-white">Contact</h2>
            <p>
              Have questions or feedback? We&apos;d love to hear from you.
            </p>
            <div className="mt-4 flex gap-4">
              <a href="mailto:hello@clipspark.app" className="btn-primary">
                📧 Email Us
              </a>
              <Link href="/contact" className="btn-secondary">
                Contact Page
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
