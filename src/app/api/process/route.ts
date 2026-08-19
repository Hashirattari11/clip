import { NextRequest, NextResponse } from "next/server";
import { processVideo } from "@/lib/pipeline";
import { checkDependencies } from "@/lib/utils";
import { getActiveProvider, ApiKeyConfig } from "@/lib/ai-provider";
import { getSessionUser, getTokenFromCookies, getUserById, deductCredit, getCredits } from "@/lib/auth";
import { getCachedVideoPath } from "@/lib/storage";

export async function POST(req: NextRequest) {
  try {
    const deps = await checkDependencies();
    if (!deps.ytdlp || !deps.ffmpeg) {
      return NextResponse.json(
        {
          error: "Missing dependencies",
          details: {
            ytdlp: deps.ytdlp,
            ffmpeg: deps.ffmpeg,
            message:
              "Install yt-dlp (pip install yt-dlp) and ffmpeg (winget install ffmpeg) then restart.",
          },
        },
        { status: 503 }
      );
    }

    const token = getTokenFromCookies(req.headers.get("cookie"));
    const sessionUser = token ? getSessionUser(token) : null;

    const { url, apiKey, provider, browser } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "YouTube URL is required" }, { status: 400 });
    }

    // Login required for all processing
    if (!sessionUser) {
      return NextResponse.json(
        { error: "Please login first to process videos" },
        { status: 401 }
      );
    }

    // Build config — user DB key takes priority
    const config: ApiKeyConfig = {};

    {
      const fullUser = getUserById(sessionUser.id);
      if (fullUser) {
        config.userId = sessionUser.id;
        config.apiKey = fullUser.apiKey || apiKey || undefined;
        config.provider = fullUser.provider || provider || "gemini";
        config.browser = fullUser.browser || browser || "chrome";
      }

      // Check credits — only 1 credit per video (0 if cached)
      const isCached = !!getCachedVideoPath(url);
      if (!isCached) {
        const creditCheck = deductCredit(sessionUser.id, 1);
        if (!creditCheck.success) {
          return NextResponse.json(
            { error: "Not enough credits. Please add more credits to continue.", remaining: creditCheck.remaining },
            { status: 402 }
          );
        }
      }
    }

    const jobId = await processVideo(url, config);
    return NextResponse.json({ jobId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const deps = await checkDependencies();
  const token = getTokenFromCookies(req.headers.get("cookie"));
  const sessionUser = token ? getSessionUser(token) : null;

  return NextResponse.json({
    ready: deps.ytdlp && deps.ffmpeg,
    ytdlp: deps.ytdlp,
    ffmpeg: deps.ffmpeg,
    aiProvider: getActiveProvider(),
    gemini: !!process.env.GEMINI_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    loggedIn: !!sessionUser,
  });
}
