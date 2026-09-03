"use client";

import { useAuth } from "../AuthProvider";
import { useLoginModal } from "../LoginModalProvider";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { openLoginModal } = useLoginModal();

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-3 py-16 sm:px-6 lg:px-8">
        <p className="text-sm text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-3 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold" style={{ color: "#814398" }}>
          Please log in
        </h1>
        <p className="text-sm text-gray-600">You need an account to view the dashboard.</p>
        <button
          type="button"
          onClick={() => openLoginModal("login")}
          style={{ color: "#ffffff" }}
          className="rounded-full bg-purple-600 px-8 py-3 text-sm font-semibold shadow-md transition hover:bg-purple-700"
        >
          Login / Sign Up
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-3 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-2xl font-bold" style={{ color: "#814398" }}>
        Welcome, {user.name}
      </h1>
      <p className="text-sm text-gray-600">{user.email}</p>
      <p className="mt-8 text-sm text-gray-500">Dashboard content coming soon.</p>
    </main>
  );
}
