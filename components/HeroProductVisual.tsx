/**
 * Placeholder for the hero product image. Shorter aspect — designed to overlap
 * upward behind the text. Swap inner content for your final image when ready.
 */
export function HeroProductVisual() {
  return (
    <div className="relative z-0 mx-auto w-full max-w-3xl px-4 sm:max-w-4xl md:px-0">
      <div
        className="aspect-[16/9] w-full rounded-2xl bg-gradient-to-br from-[#F5F5F5] to-[#EBEBEB] shadow-[0_40px_90px_-42px_rgba(35,31,32,0.15)] md:aspect-[21/9] md:rounded-3xl md:shadow-[0_50px_120px_-50px_rgba(35,31,32,0.18)]"
        role="img"
        aria-label="Product placeholder — journal hero image"
      >
        {/* Placeholder: replace with <img src="/your-journal-hero.jpg" alt="Strava Journal" className="h-full w-full object-cover rounded-2xl md:rounded-3xl" /> */}
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-16 w-24 text-[#231F20]/10 md:h-20 md:w-28">
            <svg viewBox="0 0 120 80" fill="currentColor" className="h-full w-full">
              <rect x="10" y="5" width="50" height="70" rx="2" />
              <rect x="60" y="5" width="50" height="70" rx="2" />
              <line x1="35" y1="25" x2="35" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              <line x1="85" y1="25" x2="85" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
