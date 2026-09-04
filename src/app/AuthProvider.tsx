"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  phone: string;
  name: string;
  email: string;
}

export interface RelativeInput {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  relationship: string;
}

export interface ProfileInput {
  accountType: "self" | "family";
  firstName: string;
  lastName: string;
  email: string;
  dob: string;
  gender: string;
  languages: string[];
  state: string;
  relative?: RelativeInput;
}

type Result = { ok: true } | { ok: false; error: string };
type CheckUserResult = { ok: true; isNewUser: boolean } | { ok: false; error: string };

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  checkUser: (countryCode: string, phone: string) => Promise<CheckUserResult>;
  requestOtp: (countryCode: string, phone: string) => Promise<Result>;
  verifyOtp: (countryCode: string, phone: string, otp: string, profile?: ProfileInput) => Promise<Result>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/onboard";
const authUrl = (path: string) => `${basePath}/api/auth/${path}`;

async function parseJson(res: Response): Promise<{ error?: string; user?: AuthUser; isNewUser?: boolean }> {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(authUrl("me"), { credentials: "include" })
      .then((res) => (res.ok ? (res.json() as Promise<{ user: AuthUser | null }>) : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const checkUser = useCallback(async (countryCode: string, phone: string) => {
    const res = await fetch(authUrl("check-user"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ countryCode, phone }),
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false as const, error: data.error || "Could not verify this number." };
    return { ok: true as const, isNewUser: data.isNewUser ?? true };
  }, []);

  const requestOtp = useCallback(async (countryCode: string, phone: string) => {
    const res = await fetch(authUrl("otp/request"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ countryCode, phone }),
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false as const, error: data.error || "Could not send OTP." };
    return { ok: true as const };
  }, []);

  const verifyOtp = useCallback(
    async (countryCode: string, phone: string, otp: string, profile?: ProfileInput) => {
      const res = await fetch(authUrl("otp/verify"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ countryCode, phone, otp, profile }),
      });
      const data = await parseJson(res);
      if (!res.ok) return { ok: false as const, error: data.error || "Verification failed." };
      setUser(data.user ?? null);
      return { ok: true as const };
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch(authUrl("logout"), { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, checkUser, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
