import { NextRequest, NextResponse } from "next/server";
import { getUserBySession, toPublicUser } from "@/lib/auth-store";

const SESSION_COOKIE = "ss_session";

export async function GET(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  const user = getUserBySession(sessionId);
  return NextResponse.json({ user: user ? toPublicUser(user) : null });
}
