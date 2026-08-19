import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service — ClipSpark",
  description: "ClipSpark terms of service. Read our rules, guidelines, and usage policies.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" lastUpdated="August 19, 2026">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">1. Acceptance of Terms</h2>
        <p>
          By accessing or using ClipSpark (the &quot;Service&quot;), you agree to be bound by these Terms of Service.
          If you do not agree, do not use the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">2. Description of Service</h2>
        <p>
          ClipSpark is an AI-powered tool that analyzes YouTube videos and generates short, vertical clips
          optimized for platforms like TikTok, Instagram Reels, and YouTube Shorts. Users provide their own
          API keys for AI processing.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">3. User Responsibilities</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>You must be at least 13 years old to use the Service</li>
          <li>You are responsible for maintaining the security of your account and API keys</li>
          <li>You must only submit videos that you have the right to process</li>
          <li>You must not use the Service for any illegal or unauthorized purpose</li>
          <li>You must not attempt to bypass rate limits or abuse the Service</li>
          <li>You must not redistribute or resell the Service without written permission</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">4. Intellectual Property</h2>
        <p>
          The Service, including its software, design, and branding, is owned by ClipSpark and protected by
          intellectual property laws. You retain ownership of the content you create using the Service.
          Generated clips belong to you.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">5. YouTube Content</h2>
        <p>
          Our Service processes publicly available YouTube videos. You are responsible for ensuring that
          your use complies with YouTube&apos;s Terms of Service and applicable copyright laws. We do not claim
          ownership over any video content processed through the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">6. Third-Party API Keys</h2>
        <p>
          The Service allows you to use your own third-party API keys (e.g., Google Gemini, OpenAI).
          You are responsible for your own API costs and usage. We are not responsible for any charges
          incurred through your API keys.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">7. Service Availability</h2>
        <p>
          We strive to keep the Service running but do not guarantee 100% uptime. We may perform
          maintenance, updates, or experience outages without prior notice.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">8. Limitation of Liability</h2>
        <p>
          ClipSpark is provided &quot;as is&quot; without warranties of any kind. We shall not be liable for any
          indirect, incidental, special, or consequential damages arising from your use of the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">9. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the Service at our discretion,
          without notice, for conduct that we believe violates these Terms or is harmful to other users,
          us, or third parties.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">10. Changes to Terms</h2>
        <p>
          We may update these Terms at any time. Continued use of the Service after changes constitutes
          acceptance of the new Terms.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">11. Contact</h2>
        <p>
          For questions about these Terms, contact us at{" "}
          <a href="mailto:legal@clipspark.app" className="text-brand-400 hover:underline">legal@clipspark.app</a>
        </p>
      </section>
    </LegalLayout>
  );
}
