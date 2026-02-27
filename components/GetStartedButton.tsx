"use client";

import { useAuthModal } from "@/contexts/AuthModalContext";

type GetStartedButtonProps = {
  className?: string;
};

export function GetStartedButton({ className = "" }: GetStartedButtonProps) {
  const { openModal } = useAuthModal();

  return (
    <button
      type="button"
      onClick={() => openModal("signup")}
      className={`button-primary reveal ${className}`}
      style={{ animationDelay: "220ms" }}
    >
      Get Started
    </button>
  );
}
