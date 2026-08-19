import { NextRequest, NextResponse } from "next/server";
import { deleteSession, clearSessionCookie, getTokenFromCookies } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const token = getTokenFromCookies(req.headers.get("cookie"));
  if (token) deleteSession(token);

  const response = NextResponse.json({ success: true });
  response.headers.set("Set-Cookie", clearSessionCookie());
  return response;
}
