"use client";

import type { ReactNode } from "react";

type AuthButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  variant: "primary" | "secondary";
  icon: ReactNode;
  children: ReactNode;
};

export function AuthButton({ onClick, disabled, variant, icon, children }: AuthButtonProps) {
  const base =
    "flex w-full items-center justify-center gap-3 rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2";

  const styles =
    variant === "primary"
      ? "border-2 border-[#FC4C02] bg-[#FC4C02] text-white hover:bg-[#E04502] hover:border-[#E04502] active:scale-[0.99]"
      : "border border-[#E5E5E5] bg-white text-[#231F20] hover:bg-[#F5F5F5] hover:border-[#D0D0D0] active:scale-[0.99]";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {icon}
      {children}
    </button>
  );
}
