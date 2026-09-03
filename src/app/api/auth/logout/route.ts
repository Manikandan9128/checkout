import { NextRequest, NextResponse } from "next/server";
import { destroySession } from "@/lib/auth-store";

const SESSION_COOKIE = "ss_session";

export async function POST(req: NextRequest) {
  const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) destroySession(sessionId);

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
