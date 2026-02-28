"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ProfileModalContextValue = {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const ProfileModalContext = createContext<ProfileModalContextValue | null>(null);

export function ProfileModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  return (
    <ProfileModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal() {
  const ctx = useContext(ProfileModalContext);
  if (!ctx) throw new Error("useProfileModal must be used within ProfileModalProvider");
  return ctx;
}
