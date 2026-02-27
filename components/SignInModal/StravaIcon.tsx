"use client";

export function StravaIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <img
      src="/strava.svg"
      alt=""
      className={className}
      aria-hidden
    />
  );
}
