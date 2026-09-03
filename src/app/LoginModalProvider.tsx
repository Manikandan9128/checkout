"use client";

import { createContext, useContext, useState } from "react";
import LoginModal from "./LoginModal";

type AuthModalMode = "login" | "signup";

interface LoginModalContextValue {
  openLoginModal: (mode?: AuthModalMode) => void;
  closeLoginModal: () => void;
}

const LoginModalContext = createContext<LoginModalContextValue | null>(null);

export function useLoginModal() {
  const ctx = useContext(LoginModalContext);
  if (!ctx) throw new Error("useLoginModal must be used within LoginModalProvider");
  return ctx;
}

export default function LoginModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthModalMode>("login");

  return (
    <LoginModalContext.Provider
      value={{
        openLoginModal: (m = "login") => {
          setMode(m);
          setOpen(true);
        },
        closeLoginModal: () => setOpen(false),
      }}
    >
      {children}
      <LoginModal open={open} initialMode={mode} onClose={() => setOpen(false)} />
    </LoginModalContext.Provider>
  );
}
