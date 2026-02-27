"use client";

import { useState } from "react";
import { SectionShell } from "../SectionShell";

const qualities = [
  {
    title: "Printed",
    detail: "Made as a physical volume, not another screen.",
    visual: "printed"
  },
  {
    title: "Personal",
    detail: "Every page comes from your own training history.",
    visual: "personal"
  },
  {
    title: "Lasting",
    detail: "Built to hold years of effort in one place.",
    visual: "lasting"
  },
  {
    title: "Designed to keep",
    detail: "A quiet object of record, made for return visits.",
    visual: "designed"
  }
];

/** Minimal placeholder visuals — swap for real product imagery later */
function FeatureVisual({ type }: { type: string }) {
  const base = "mx-auto flex aspect-[4/3] max-w-md items-center justify-center rounded-2xl";
  const bg = "bg-gradient-to-br from-[#F0F0F0] to-[#E5E5E5]";

  if (type === "printed") {
    return (
      <div className={`${base} ${bg}`}>
        <svg viewBox="0 0 120 80" className="h-24 w-32 text-[#231F20]/15">
          <rect x="10" y="5" width="50" height="70" rx="2" fill="currentColor" />
          <rect x="60" y="5" width="50" height="70" rx="2" fill="currentColor" />
          <line x1="35" y1="25" x2="35" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
          <line x1="85" y1="25" x2="85" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        </svg>
      </div>
    );
  }
  if (type === "personal") {
    return (
      <div className={`${base} ${bg}`}>
        <svg viewBox="0 0 80 80" className="h-24 w-24 text-[#231F20]/15">
          <circle cx="40" cy="28" r="12" fill="currentColor" />
          <path d="M20 72 Q40 50 60 72" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
    );
  }
  if (type === "lasting") {
    return (
      <div className={`${base} ${bg}`}>
        <svg viewBox="0 0 100 80" className="h-24 w-28 text-[#231F20]/15">
          <rect x="15" y="10" width="70" height="12" rx="1" fill="currentColor" />
          <rect x="20" y="25" width="60" height="12" rx="1" fill="currentColor" opacity="0.8" />
          <rect x="25" y="40" width="50" height="12" rx="1" fill="currentColor" opacity="0.6" />
          <rect x="30" y="55" width="40" height="12" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </div>
    );
  }
  if (type === "designed") {
    return (
      <div className={`${base} ${bg}`}>
        <svg viewBox="0 0 100 80" className="h-24 w-28 text-[#231F20]/15">
          <rect x="25" y="15" width="50" height="50" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
          <rect x="32" y="22" width="36" height="36" rx="2" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
    );
  }
  return null;
}

export function CraftSection() {
  const [selected, setSelected] = useState(0);
  const quality = qualities[selected];

  return (
    <SectionShell>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="heading reveal text-4xl leading-tight text-[#231F20] sm:text-5xl md:text-6xl">
          Crafted as an archive,
          <br />
          not a notebook.
        </h2>
      </div>

      <div className="mt-14 flex flex-col items-center">
        {/* Visual first */}
        <div key={quality.visual} className="animate-fade-in w-full">
          <FeatureVisual type={quality.visual} />
        </div>

        {/* Pill selector centered below image */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex flex-wrap justify-center gap-1 rounded-2xl bg-[#F0F0F0] p-1.5">
            {qualities.map((item, index) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setSelected(index)}
                className={`rounded-xl px-4 py-2.5 text-center text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 ${
                  selected === index
                    ? "bg-white text-[#231F20] shadow-sm"
                    : "text-[#6B6B6B] hover:bg-white/80 hover:text-[#231F20]"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {/* Description text */}
        <p className="mx-auto mt-8 max-w-xl text-center text-[15px] leading-relaxed text-[#231F20]/80">
          {quality.detail}
        </p>
      </div>
    </SectionShell>
  );
}
