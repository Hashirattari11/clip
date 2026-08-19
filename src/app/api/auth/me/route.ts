import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getTokenFromCookies, getCredits } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = getTokenFromCookies(req.headers.get("cookie"));
  if (!token) {
    return NextResponse.json({ user: null });
  }

  const user = await getSessionUser(token);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const credits = await getCredits(user.id);
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, credits } });
}
