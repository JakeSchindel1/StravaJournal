"use client";

import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAuthHaptics } from "@/hooks/useAuthHaptics";
import { track } from "@/lib/analytics/posthog";

type GetStartedButtonProps = {
  className?: string;
};

export function GetStartedButton({ className = "" }: GetStartedButtonProps) {
  const { openModal } = useAuthModal();
  const { triggerAuthTap } = useAuthHaptics();

  return (
    <button
      type="button"
      onClick={() => {
        track("get_started_clicked");
        triggerAuthTap();
        openModal("signup");
      }}
      className={`button-primary reveal ${className}`}
      style={{ animationDelay: "220ms" }}
    >
      Get Started
    </button>
  );
}
