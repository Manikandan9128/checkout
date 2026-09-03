import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  createUser,
  findUserByPhone,
  normalizePhone,
  Profile,
  toPublicUser,
  verifyOtpCode,
} from "@/lib/auth-store";

const SESSION_COOKIE = "ss_session";

interface VerifyBody {
  countryCode?: string;
  phone?: string;
  otp?: string;
  profile?: Profile;
}

function validateProfile(profile: Profile): string | null {
  if (!profile.firstName?.trim()) return "First name is required.";
  if (!profile.lastName?.trim()) return "Last name is required.";
  if (!profile.dob) return "Date of birth is required.";
  if (!profile.gender) return "Gender is required.";
  if (profile.email && !/^\S+@\S+\.\S+$/.test(profile.email)) return "Enter a valid email address.";
  if (profile.accountType === "family") {
    const r = profile.relative;
    if (!r?.firstName?.trim() || !r?.lastName?.trim() || !r?.phone?.trim()) {
      return "Relative's name and phone are required.";
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  let body: VerifyBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const countryCode = body.countryCode ?? "";
  const phone = (body.phone ?? "").trim();
  const otp = body.otp ?? "";

  if (!/^\+\d{1,4}$/.test(countryCode) || phone.length < 4) {
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
  }
  if (!verifyOtpCode(otp)) {
    return NextResponse.json({ error: "Enter the 6-digit OTP." }, { status: 400 });
  }

  const fullPhone = normalizePhone(countryCode, phone);

  if (body.profile) {
    const error = validateProfile(body.profile);
    if (error) return NextResponse.json({ error }, { status: 400 });

    const user = createUser(fullPhone, body.profile);
    const sessionId = createSession(user.id);
    const res = NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
    res.cookies.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  const user = findUserByPhone(fullPhone);
  if (!user) {
    return NextResponse.json({ error: "No account found for this number. Please sign up." }, { status: 404 });
  }

  const sessionId = createSession(user.id);
  const res = NextResponse.json({ user: toPublicUser(user) });
  res.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
