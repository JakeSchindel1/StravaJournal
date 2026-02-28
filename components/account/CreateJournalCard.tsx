"use client";

/**
 * Special "Create new journal" tile in the journals list.
 * Opens JournalBuilderModal on click.
 */

type CreateJournalCardProps = {
  onCreate: () => void;
};

export function CreateJournalCard({ onCreate }: CreateJournalCardProps) {
  return (
    <button
      type="button"
      onClick={onCreate}
      className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-[#E5E5E5] bg-white p-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E5E5E5] hover:bg-[#F5F5F5] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 active:scale-[0.99]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#E5E5E5] bg-white transition group-hover:border-[#231F20]/20 group-hover:bg-[#F5F5F5]">
        <svg
          className="h-6 w-6 text-[#6B6B6B] transition group-hover:text-[#231F20]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
      <div>
        <p className="heading font-semibold text-[#231F20]">Create a new journal</p>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Choose dates, cover, and layout in 60 seconds.
        </p>
      </div>
    </button>
  );
}
