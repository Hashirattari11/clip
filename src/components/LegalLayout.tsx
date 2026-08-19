"use client";

import Link from "next/link";

export default function LegalLayout({ children, title, lastUpdated }: { children: React.ReactNode; title: string; lastUpdated: string }) {
  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="mb-6 inline-block text-sm text-gray-400 hover:text-white transition-colors">
          ← Home
        </Link>
        <h1 className="mb-2 text-3xl font-bold">{title}</h1>
        <p className="mb-8 text-sm text-gray-500">Last updated: {lastUpdated}</p>
        <div className="prose prose-invert max-w-none space-y-6 text-gray-300 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
