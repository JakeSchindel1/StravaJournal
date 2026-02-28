"use client";

/**
 * Product-like card for a journal in the /account journals list.
 * Premium cues: subtle border, soft shadow, hover lift.
 */

import type { Journal } from "@/lib/mock-journals";

type JournalCardProps = {
  journal: Journal;
  onContinue: (id: string) => void;
};

const STATUS_STYLES: Record<Journal["status"], string> = {
  Draft: "bg-[#F0F0F0] text-[#6B6B6B]",
  "Ready to print": "bg-[#E8F5E9] text-[#2E7D32]",
  Shipped: "bg-[#E3F2FD] text-[#1565C0]"
};

export function JournalCard({ journal, onContinue }: JournalCardProps) {
  const meta = `${journal.dateRangeLabel} · ${journal.activityCount} activities · ${journal.distanceLabel}`;

  return (
    <div
      className="group flex flex-col gap-4 rounded-2xl border border-[#E5E5E5]/80 bg-white p-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex flex-1 gap-4 sm:items-center">
        {/* Cover thumbnail placeholder */}
        <div className="h-20 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5]">
          {journal.coverImageUrl ? (
            <img
              src={journal.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg
                viewBox="0 0 24 32"
                className="h-8 w-6 text-[#231F20]/15"
                fill="currentColor"
              >
                <rect x="2" y="2" width="20" height="28" rx="1" />
                <line x1="8" y1="10" x2="16" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              </svg>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="heading truncate text-lg font-semibold text-[#231F20]">
            {journal.title}
          </h3>
          <p className="mt-0.5 truncate text-sm text-[#6B6B6B]">{meta}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[journal.status]}`}
            >
              {journal.status}
            </span>
            {journal.price && (
              <span className="text-sm font-medium text-[#231F20]">
                {journal.price}
              </span>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onContinue(journal.id)}
        className="button-primary w-full py-2.5 sm:w-auto sm:px-6 active:scale-[0.98] transition-transform"
      >
        Continue
      </button>
    </div>
  );
}
