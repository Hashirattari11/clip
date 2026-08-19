import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy — ClipSpark",
  description: "ClipSpark privacy policy. Learn how we handle your data, API keys, and video content.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 19, 2026">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">1. Introduction</h2>
        <p>
          Welcome to ClipSpark (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use
          our website and services located at clipspark.app (the &quot;Service&quot;).
        </p>
        <p>
          By using the Service, you agree to the collection and use of information in accordance with this policy.
          If you do not agree, please discontinue use of the Service.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">2. Information We Collect</h2>
        <h3 className="mb-2 text-lg font-medium text-white">Account Information</h3>
        <p>When you create an account, we collect your name, email address, and a securely hashed password.</p>

        <h3 className="mb-2 mt-4 text-lg font-medium text-white">API Keys</h3>
        <p>
          If you provide third-party API keys (e.g., Google Gemini or OpenAI), they are stored locally on our
          servers and associated with your account. We never share, sell, or transmit your API keys to third parties.
          Your keys are used solely to process your video clipping requests.
        </p>

        <h3 className="mb-2 mt-4 text-lg font-medium text-white">Video Content</h3>
        <p>
          We process YouTube videos you submit for clipping. Video files and generated clips are stored temporarily
          on our servers for your convenience. You may delete your projects at any time. We do not share your video
          content with third parties.
        </p>

        <h3 className="mb-2 mt-4 text-lg font-medium text-white">Usage Data</h3>
        <p>
          We may collect anonymized usage data including pages visited, features used, and processing times
          to improve our Service. This data cannot be used to identify you personally.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">3. How We Use Your Information</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>To provide, maintain, and improve the Service</li>
          <li>To process your video clipping requests using your API keys</li>
          <li>To send you service-related communications</li>
          <li>To detect and prevent abuse or technical issues</li>
          <li>To comply with legal obligations</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">4. Data Storage &amp; Security</h2>
        <p>
          We use industry-standard encryption and security practices. Your data is stored on secure servers
          with access controls. Passwords are hashed using bcrypt. API keys are stored in encrypted format.
          However, no method of transmission over the Internet is 100% secure.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">5. Data Sharing</h2>
        <p>We do not sell, trade, or rent your personal information. We may share information only:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>With your explicit consent</li>
          <li>To comply with legal obligations</li>
          <li>To protect our rights and safety</li>
          <li>In connection with a merger, acquisition, or sale of assets (with prior notice)</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">6. Cookies</h2>
        <p>
          We use essential cookies to maintain your session and authentication state. We do not use
          tracking cookies or third-party advertising cookies.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">7. Your Rights</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>Access your personal data</li>
          <li>Correct inaccurate data</li>
          <li>Delete your account and associated data</li>
          <li>Export your data</li>
          <li>Withdraw consent for data processing</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">8. Children&apos;s Privacy</h2>
        <p>
          The Service is not intended for use by children under 13. We do not knowingly collect information
          from children under 13. If we discover such information, we will delete it immediately.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">9. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes
          by posting the updated policy on this page with a revised &quot;Last Updated&quot; date.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">10. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{" "}
          <a href="mailto:privacy@clipspark.app" className="text-brand-400 hover:underline">privacy@clipspark.app</a>
        </p>
      </section>
    </LegalLayout>
  );
}
