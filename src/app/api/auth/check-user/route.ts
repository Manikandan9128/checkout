import { NextRequest, NextResponse } from "next/server";
import { findUserByPhone, normalizePhone } from "@/lib/auth-store";

export async function POST(req: NextRequest) {
  let body: { countryCode?: string; phone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const countryCode = body.countryCode ?? "";
  const phone = (body.phone ?? "").trim();

  if (!/^\+\d{1,4}$/.test(countryCode) || phone.length < 4) {
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
  }

  const isNewUser = !findUserByPhone(normalizePhone(countryCode, phone));
  return NextResponse.json({ ok: true, isNewUser });
}
