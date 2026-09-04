"use client";

import { createContext, useContext, useState } from "react";
import LoginModal from "./LoginModal";

interface LoginModalContextValue {
  openLoginModal: () => void;
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

  return (
    <LoginModalContext.Provider
      value={{
        openLoginModal: () => setOpen(true),
        closeLoginModal: () => setOpen(false),
      }}
    >
      {children}
      <LoginModal open={open} onClose={() => setOpen(false)} />
    </LoginModalContext.Provider>
  );
}
