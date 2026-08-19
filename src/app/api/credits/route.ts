import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, getTokenFromCookies, getCredits, deductCredit, addCredits } from "@/lib/auth";

async function requireAuth(req: NextRequest) {
  const token = getTokenFromCookies(req.headers.get("cookie"));
  if (!token) return null;
  return getSessionUser(token);
}

// GET /api/credits — check balance
export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const credits = await getCredits(user.id);
  return NextResponse.json({ credits, userId: user.id });
}

// POST /api/credits — deduct credits for processing
// body: { action: "deduct" | "add", amount?: number }
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { action, amount } = await req.json();

  if (action === "deduct") {
    const cost = amount || 1;
    const result = await deductCredit(user.id, cost);
    if (!result.success) {
      return NextResponse.json(
        { error: "Not enough credits", remaining: result.remaining },
        { status: 402 }
      );
    }
    return NextResponse.json({ credits: result.remaining, deducted: cost });
  }

  if (action === "add") {
    const addAmt = amount || 10;
    const remaining = await addCredits(user.id, addAmt);
    return NextResponse.json({ credits: remaining, added: addAmt });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
