"use client";

import { useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";

interface LoginModalProps {
  open: boolean;
  initialMode: "login" | "signup";
  onClose: () => void;
}

export default function LoginModal({ open, initialMode, onClose }: LoginModalProps) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  if (!open) return null;

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSubmitting(false);
  };

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "signup" && !name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    const result =
      mode === "signup" ? await signup({ name, email, password }) : await login({ email, password });
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    reset();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onClick={handleClose}
    >
      <div
        className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-xl sm:flex-row sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition hover:bg-gray-100 sm:right-6 sm:top-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className="relative h-40 w-full shrink-0 sm:h-auto sm:w-[45%]"
          style={{ background: "linear-gradient(135deg, #814398 0%, #C4A8D4 100%)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cdn.prod.website-files.com/69df9a13ad765128599ea0d4/69df9a13ad765128599ea0da_Saksham%20Senior%20Logo.svg"
            alt="Saksham Senior"
            className="absolute left-6 top-6 h-8 w-auto brightness-0 invert sm:left-8 sm:top-8"
          />
        </div>

        <div className="flex w-full flex-col px-5 pb-6 pt-6 sm:w-[55%] sm:px-10 sm:py-12">
          <div className="mb-6 flex gap-6 border-b border-gray-200">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="relative pb-3 text-sm font-semibold transition"
                style={{ color: mode === m ? "#814398" : "#9ca3af" }}
              >
                {m === "login" ? "Login" : "Sign Up"}
                {mode === m && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full" style={{ backgroundColor: "#814398" }} />
                )}
              </button>
            ))}
          </div>

          <h2 className="text-xl font-bold" style={{ color: "#814398" }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            {mode === "login" ? "Login to continue to Saksham Senior." : "Sign up to get started with Saksham Senior."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {mode === "signup" && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-800">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                autoFocus={mode === "login"}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-800">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{ color: "#ffffff" }}
              className="mt-2 w-full rounded-full bg-purple-600 px-6 py-4 text-base font-semibold shadow-md transition hover:bg-purple-700 active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
