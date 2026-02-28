"use client";

/**
 * Hero section for /account. Matches landing page vibe with headline, CTA, and 3D journal placeholder.
 */

import Link from "next/link";

type AccountHeroProps = {
  onCreateJournal: () => void;
};

export function AccountHero({ onCreateJournal }: AccountHeroProps) {
  return (
    <header className="relative overflow-hidden px-6 pb-24 pt-24 md:px-12 md:pb-32 md:pt-28 lg:pt-32">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.02)_0%,_transparent_70%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        {/* Left: text content */}
        <div className="flex flex-1 flex-col text-center lg:text-left">
          <h1 className="heading text-5xl font-bold leading-[1.02] text-[#231F20] sm:text-6xl md:text-7xl">
            Your journals.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#231F20]/80 sm:text-lg">
            Designed from your training. Printed to keep.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={onCreateJournal}
              className="button-primary w-full sm:w-auto active:scale-[0.98] transition-transform"
            >
              Create a new journal
            </button>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-[#6B6B6B] underline decoration-[#E5E5E5] underline-offset-4 transition hover:text-[#231F20]"
            >
              How it works
            </Link>
          </div>
        </div>

        {/* Right: 3D journal placeholder — stacks below on mobile */}
        <div className="mt-12 w-full max-w-md flex-shrink-0 lg:mt-0 lg:max-w-lg">
          <div
            className="aspect-[4/3] w-full rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-[#EBEBEB] shadow-[0_40px_90px_-42px_rgba(35,31,32,0.15)] md:rounded-3xl md:shadow-[0_50px_120px_-50px_rgba(35,31,32,0.18)]"
            role="img"
            aria-label="Premium journal placeholder"
          >
            <div className="flex h-full w-full items-center justify-center">
              <svg
                viewBox="0 0 120 80"
                fill="currentColor"
                className="h-20 w-28 text-[#231F20]/10 md:h-24 md:w-32"
              >
                <rect x="10" y="5" width="50" height="70" rx="2" />
                <rect x="60" y="5" width="50" height="70" rx="2" />
                <line x1="35" y1="25" x2="35" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <line x1="85" y1="25" x2="85" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
