export function JournalVisual() {
  return (
    <figure className="relative mx-auto mt-14 h-[280px] w-[330px] max-w-full sm:h-[320px] sm:w-[460px]">
      <div className="absolute left-1/2 top-[72%] h-14 w-[80%] -translate-x-1/2 rounded-full bg-[#1D1C1A]/20 blur-2xl" />

      <div className="absolute left-1/2 top-1/2 h-[220px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[#D5D0C6] bg-gradient-to-br from-[#F4F1EB] via-[#E8E3D8] to-[#D9D2C5] shadow-journal sm:h-[260px] sm:w-[230px]">
        <div className="absolute left-[7%] top-[8%] h-[84%] w-[3px] rounded-full bg-[#CEC7BB]" />
        <div className="absolute inset-x-[13%] top-[16%] border-t border-[#BDB7AB]/75" />
        <div className="absolute left-[13%] top-[20%] text-[9px] uppercase tracking-[0.35em] text-[#6B685F] sm:text-[10px]">
          Training Log
        </div>
        <div className="heading absolute left-[13%] top-[30%] max-w-[70%] text-[22px] leading-none text-[#23221F] sm:text-[26px]">
          Your Miles
          <br />
          2026
        </div>

        <div className="absolute bottom-[14%] left-[13%] right-[13%] h-[28%] rounded-md border border-[#CFC8BC] bg-[#F7F5F0]/75 p-2">
          <div className="h-[2px] w-8 rounded-full bg-[#8D877A]" />
          <div className="mt-2 h-[2px] w-14 rounded-full bg-[#A39D90]" />
          <div className="mt-2 grid grid-cols-6 gap-[3px]">
            {Array.from({ length: 18 }).map((_, index) => (
              <span
                key={index}
                className="h-[8px] rounded-sm bg-[#B7B0A3]/85"
                style={{ opacity: 0.4 + (index % 3) * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
