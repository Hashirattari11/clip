import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApiKeyProvider } from "@/lib/api-key-context";
import { AuthProvider } from "@/lib/auth-context";
import ApiKeyModal from "@/components/ApiKeyModal";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ClipSpark — Turn Long Videos into Viral Clips with AI",
    template: "%s — ClipSpark",
  },
  description:
    "Turn any YouTube video into viral short clips for TikTok, Reels, and Shorts. AI finds the best moments, auto-reframes to 9:16, ready to post.",
  keywords: [
    "video clips",
    "TikTok clips",
    "YouTube shorts",
    "Instagram Reels",
    "AI video editor",
    "clip maker",
    "viral clips",
    "short form content",
    "video clipping tool",
    "ClipSpark",
  ],
  authors: [{ name: "ClipSpark" }],
  creator: "ClipSpark",
  metadataBase: new URL("https://clipspark.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clipspark.app",
    siteName: "ClipSpark",
    title: "ClipSpark — Turn Long Videos into Viral Clips with AI",
    description:
      "Paste a YouTube link. AI finds the best moments, creates vertical clips — ready for TikTok, Reels & Shorts.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "ClipSpark" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClipSpark — Turn Long Videos into Viral Clips with AI",
    description:
      "Paste a YouTube link. AI finds the best moments, creates vertical clips — ready for TikTok, Reels & Shorts.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="canonical" href="https://clipspark.app" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ApiKeyProvider>
            <div className="flex min-h-screen flex-col">
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <ApiKeyModal />
          </ApiKeyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-dark-900/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Top section */}
        <div className="mb-8 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 font-bold">C</div>
              <span className="text-lg font-bold">ClipSpark</span>
            </div>
            <p className="text-sm text-gray-400">
              Turn long videos into viral short clips with AI. Free, fast, and privacy-first.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Product</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/settings" className="hover:text-white transition-colors">Settings</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/auth" className="hover:text-white transition-colors">Sign Up / Login</Link></li>
              <li><Link href="/credits" className="hover:text-white transition-colors">Credits</Link></li>
              <li><a href="mailto:hello@clipspark.app" className="hover:text-white transition-colors">Email Support</a></li>
              <li><a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Get Gemini API Key</a></li>
              <li><a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Get OpenAI API Key</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>© {new Date().getFullYear()} ClipSpark. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span>Built with AI</span>
            <span>•</span>
            <span>Privacy-first</span>
            <span>•</span>
            <span>Free to use</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
