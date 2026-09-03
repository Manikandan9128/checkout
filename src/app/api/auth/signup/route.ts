import { NextRequest, NextResponse } from "next/server";
import { createSession, createUser, toPublicUser } from "@/lib/auth-store";

const SESSION_COOKIE = "ss_session";

export async function POST(req: NextRequest) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const password = body.password ?? "";

  if (!name) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const result = await createUser(name, email, password);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 409 });
  }

  const sessionId = createSession(result.user.id);
  const res = NextResponse.json({ user: toPublicUser(result.user) }, { status: 201 });
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
