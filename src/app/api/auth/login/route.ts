import { NextRequest, NextResponse } from "next/server";
import { loginUser, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const user = await loginUser(email, password);
    const token = createSession(user.id);

    const response = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name },
    });
    response.headers.set("Set-Cookie", setSessionCookie(token));
    return response;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
