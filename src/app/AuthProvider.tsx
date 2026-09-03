"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface SignupInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  signup: (input: SignupInput) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const authUrl = (path: string) => `${basePath}/api/auth/${path}`;

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

async function parseJson(res: Response): Promise<{ error?: string; user?: AuthUser }> {
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

  const login = useCallback(async (input: LoginInput) => {
    const res = await fetch(authUrl("login"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false as const, error: data.error || "Login failed." };
    setUser(data.user ?? null);
    return { ok: true as const };
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const res = await fetch(authUrl("signup"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(input),
    });
    const data = await parseJson(res);
    if (!res.ok) return { ok: false as const, error: data.error || "Signup failed." };
    setUser(data.user ?? null);
    return { ok: true as const };
  }, []);

  const logout = useCallback(async () => {
    await fetch(authUrl("logout"), { method: "POST", credentials: "include" });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
