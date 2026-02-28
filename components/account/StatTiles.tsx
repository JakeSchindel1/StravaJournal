"use client";

/**
 * Three compact stat cards for /account. Mock data; structure ready for real values.
 */

export type StatTileData = {
  value: string;
  label: string;
};

const MOCK_STATS: StatTileData[] = [
  { value: "1,842 mi", label: "This year" },
  { value: "4.2 days/week", label: "Consistency" },
  { value: "19 days", label: "Longest streak" }
];

export function StatTiles({ stats = MOCK_STATS }: { stats?: StatTileData[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[#E5E5E5]/80 bg-white px-6 py-5 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] transition hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
        >
          <p className="heading text-2xl font-bold text-[#231F20] sm:text-3xl">
            {stat.value}
          </p>
          <p className="mt-1 text-sm text-[#6B6B6B]">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
