"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { SignInModal } from "@/components/SignInModal";

type AuthModalMode = "signup" | "signin";

type AuthModalContextValue = {
  openModal: (mode?: AuthModalMode) => void;
  closeModal: () => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialMode, setInitialMode] = useState<AuthModalMode>("signup");
  const [initialShowEmailForm, setInitialShowEmailForm] = useState(false);

  const openModal = useCallback((mode: AuthModalMode = "signup") => {
    setInitialMode(mode);
    setInitialShowEmailForm(mode === "signin");
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <AuthModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      <SignInModal isOpen={isOpen} onClose={closeModal} initialMode={initialMode} initialShowEmailForm={initialShowEmailForm} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used within AuthModalProvider");
  return ctx;
}
