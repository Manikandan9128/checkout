/**
 * TEMPORARY in-memory auth store.
 *
 * The real backend team owns login/signup persistence long-term. This module
 * exists only so the UI (login/signup popup, session persistence, header
 * auth state) can be built and demoed end-to-end before that backend exists.
 *
 * Known limitation: Cloudflare Workers can run multiple isolates, so this
 * Map is NOT guaranteed to be shared across all requests/instances in
 * production. Replace signup()/verifyLogin()/getSessionUser() below with
 * real API calls once the backend team ships real endpoints — the route
 * handlers in src/app/api/auth/* are written so only this file needs to
 * change, not the frontend.
 */

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
}

const users = new Map<string, StoredUser>(); // key: email
const sessions = new Map<string, string>(); // key: sessionId, value: userId

async function hashPassword(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createUser(name: string, email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (users.has(normalizedEmail)) {
    return { ok: false as const, error: "An account with this email already exists." };
  }
  const salt = crypto.randomUUID();
  const passwordHash = await hashPassword(password, salt);
  const user: StoredUser = { id: crypto.randomUUID(), name, email: normalizedEmail, passwordHash, salt };
  users.set(normalizedEmail, user);
  return { ok: true as const, user };
}

export async function verifyLogin(email: string, password: string) {
  const user = users.get(email.trim().toLowerCase());
  if (!user) return { ok: false as const, error: "Invalid email or password." };
  const candidateHash = await hashPassword(password, user.salt);
  if (candidateHash !== user.passwordHash) {
    return { ok: false as const, error: "Invalid email or password." };
  }
  return { ok: true as const, user };
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
  return { id: user.id, name: user.name, email: user.email };
}
