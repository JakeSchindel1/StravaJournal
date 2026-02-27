"use client";

import { useState } from "react";
import { SignInModal } from "./SignInModal";

type GetStartedButtonProps = {
  className?: string;
};

export function GetStartedButton({ className = "" }: GetStartedButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className={`button-primary reveal ${className}`}
        style={{ animationDelay: "220ms" }}
      >
        Get Started
      </button>
      <SignInModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
