import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Refund Policy — ClipSpark",
  description: "ClipSpark refund policy. Learn about our no-questions-asked refund approach.",
};

export default function RefundPage() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="August 19, 2026">
      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Overview</h2>
        <p>
          ClipSpark is a free tool that uses your own API keys. Since we do not charge for the Service itself,
          there are no direct payments to refund. However, this policy covers situations related to third-party
          API costs incurred through our platform.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Third-Party API Costs</h2>
        <p>
          When you use ClipSpark with your own API keys (Google Gemini, OpenAI, etc.), you are billed
          directly by those providers. ClipSpark has no control over these charges and cannot refund them.
        </p>
        <p className="mt-2">
          If you experience unexpected charges due to a bug in ClipSpark, please contact us immediately
          at{" "}
          <a href="mailto:support@clipspark.app" className="text-brand-400 hover:underline">
            support@clipspark.app
          </a>{" "}
          and we will investigate and work with you to resolve the issue.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Service Issues</h2>
        <p>
          If ClipSpark fails to process your video due to a technical issue on our end, you will not be
          charged anything by ClipSpark (the Service is free). We recommend retrying once the issue is resolved.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">Contact</h2>
        <p>
          For refund-related inquiries, contact us at{" "}
          <a href="mailto:support@clipspark.app" className="text-brand-400 hover:underline">
            support@clipspark.app
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
