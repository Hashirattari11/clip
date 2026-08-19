import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getTokenFromCookies, updateUser, getUserById } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromCookies(req.headers.get("cookie"));
    if (!token) {
      return NextResponse.json({ error: "Please login first" }, { status: 401 });
    }

    const sessionUser = getSessionUser(token);
    if (!sessionUser) {
      return NextResponse.json({ error: "Session expired, please login again" }, { status: 401 });
    }

    const { apiKey, provider, browser } = await req.json();

    // Validate apiKey only if provided
    if (apiKey !== undefined && apiKey !== null && apiKey !== "" && typeof apiKey === "string" && apiKey !== "placeholder") {
      if (apiKey.length < 5) {
        return NextResponse.json({ error: "API key too short" }, { status: 400 });
      }
    }

    const updates: { apiKey?: string; provider?: string; browser?: string } = {};
    if (apiKey && typeof apiKey === "string" && apiKey !== "placeholder" && apiKey.length >= 5) {
      updates.apiKey = apiKey.trim();
    }
    if (provider) updates.provider = provider;
    if (browser) updates.browser = browser;

    updateUser(sessionUser.id, updates);

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const token = getTokenFromCookies(req.headers.get("cookie"));
  if (!token) {
    return NextResponse.json({ hasKey: false });
  }

  const sessionUser = getSessionUser(token);
  if (!sessionUser) {
    return NextResponse.json({ hasKey: false });
  }

  const fullUser = getUserById(sessionUser.id);
  const key = fullUser?.apiKey || "";
  const masked = key ? key.slice(0, 4) + "••••••••" + key.slice(-4) : "";
  return NextResponse.json({
    hasKey: !!key,
    maskedKey: masked,
    provider: fullUser?.provider || "gemini",
    browser: fullUser?.browser || "chrome",
  });
}
