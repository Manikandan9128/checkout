/**
 * TEMPORARY in-memory auth store for phone+OTP login/signup.
 *
 * The real backend team owns OTP delivery/verification and persistence
 * long-term. This module exists only so the UI can be built and demoed
 * end-to-end before that backend exists.
 *
 * Stub behavior: any 6-digit code is accepted as a valid OTP (there is no
 * real SMS gateway wired up). Replace requestOtp()/verifyOtp() below with
 * real API calls once the backend team ships real endpoints — the route
 * handlers in src/app/api/auth/* are written so only this file needs to
 * change, not the frontend.
 *
 * Known limitation: Cloudflare Workers can run multiple isolates, so this
 * Map is NOT guaranteed to be shared across all requests/instances in
 * production.
 */

export type AccountType = "self" | "family";

export interface RelativeInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface Profile {
  accountType: AccountType;
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  gender: string;
  languages: string[];
  state: string;
  relative?: RelativeInfo;
}

export interface StoredUser {
  id: string;
  phone: string;
  profile: Profile;
}

const users = new Map<string, StoredUser>(); // key: phone (e.g. "+919876543210")
const sessions = new Map<string, string>(); // key: sessionId, value: userId

export function normalizePhone(countryCode: string, phone: string) {
  return `${countryCode}${phone}`.replace(/\s/g, "");
}

export function requestOtp(_phone: string) {
  // Stub: no real SMS sent. Always succeeds.
  return { ok: true as const };
}

export function verifyOtpCode(otp: string) {
  return /^\d{6}$/.test(otp);
}

export function findUserByPhone(phone: string): StoredUser | null {
  return users.get(phone) ?? null;
}

export function createUser(phone: string, profile: Profile): StoredUser {
  const user: StoredUser = { id: crypto.randomUUID(), phone, profile };
  users.set(phone, user);
  return user;
}

export function createSession(userId: string) {
  const sessionId = crypto.randomUUID();
  sessions.set(sessionId, userId);
  return sessionId;
}

export function destroySession(sessionId: string) {
  sessions.delete(sessionId);
}

export function getUserBySession(sessionId: string | undefined): StoredUser | null {
  if (!sessionId) return null;
  const userId = sessions.get(sessionId);
  if (!userId) return null;
  for (const user of users.values()) {
    if (user.id === userId) return user;
  }
  return null;
}

export function toPublicUser(user: StoredUser) {
  return {
    id: user.id,
    phone: user.phone,
    name: `${user.profile.firstName} ${user.profile.lastName}`.trim(),
    email: user.profile.email,
  };
}
