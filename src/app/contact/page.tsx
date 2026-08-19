"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mailto = `mailto:hello@clipspark.app?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.location.href = mailto;
    setSent(true);
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-block text-sm text-gray-400 hover:text-white transition-colors">
          ← Home
        </Link>

        <h1 className="mb-2 text-3xl font-bold">Contact Us</h1>
        <p className="mb-8 text-gray-400">
          Have a question, suggestion, or need help? We&apos;re here for you.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Form */}
          <div className="glass-card p-6">
            <h2 className="mb-4 text-lg font-semibold">Send a Message</h2>
            {sent ? (
              <div className="rounded-xl bg-green-500/10 p-6 text-center">
                <div className="mb-2 text-3xl">✅</div>
                <p className="font-medium text-green-400">Email client opened!</p>
                <p className="mt-1 text-sm text-gray-400">Send the email to reach us.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="How can we help?"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-300">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us more..."
                    className="input-field min-h-[150px] resize-y"
                    required
                  />
                </div>
                <button type="submit" className="btn-primary w-full">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="glass-card p-6">
              <h3 className="mb-2 font-semibold">📧 Email</h3>
              <a href="mailto:hello@clipspark.app" className="text-brand-400 hover:underline">
                hello@clipspark.app
              </a>
              <p className="mt-1 text-sm text-gray-500">For general inquiries and support</p>
            </div>

            <div className="glass-card p-6">
              <h3 className="mb-2 font-semibold">🔒 Privacy</h3>
              <a href="mailto:privacy@clipspark.app" className="text-brand-400 hover:underline">
                privacy@clipspark.app
              </a>
              <p className="mt-1 text-sm text-gray-500">For privacy-related questions</p>
            </div>

            <div className="glass-card p-6">
              <h3 className="mb-2 font-semibold">⚡ Bug Reports</h3>
              <p className="text-sm text-gray-400">
                Found a bug? Email us with details or use the form. We typically respond within 24 hours.
              </p>
            </div>

            <div className="glass-card p-6">
              <h3 className="mb-2 font-semibold">🤝 Partnerships</h3>
              <p className="text-sm text-gray-400">
                Interested in integrating or partnering? Reach out via email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
