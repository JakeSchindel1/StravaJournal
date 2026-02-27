import { SectionShell } from "../SectionShell";

const qualities = [
  {
    title: "Printed",
    detail: "Made as a physical volume, not another screen."
  },
  {
    title: "Personal",
    detail: "Every page comes from your own training history."
  },
  {
    title: "Lasting",
    detail: "Built to hold years of effort in one place."
  },
  {
    title: "Designed to keep",
    detail: "A quiet object of record, made for return visits."
  }
];

export function CraftSection() {
  return (
    <SectionShell>
      <div className="max-w-3xl">
        <h2 className="heading reveal text-4xl leading-tight text-[#1A1917] sm:text-5xl md:text-6xl">
          Crafted as an archive,
          <br />
          not a notebook.
        </h2>
      </div>

      {/* Horizontal scroll on mobile (scroll-snap), grid on desktop — Apple-style minimal cards */}
      <div className="mt-14 -mx-6 overflow-x-auto px-6 scroll-smooth scrollbar-hide md:mx-0 md:overflow-visible md:px-0">
        <div className="flex gap-4 snap-x snap-mandatory md:grid md:grid-cols-2 md:snap-none md:gap-6">
          {qualities.map((item, index) => (
            <article
              key={item.title}
              className="reveal flex min-w-[280px] shrink-0 snap-center flex-col rounded-2xl border border-[#E8E3D8] bg-white/80 p-8 backdrop-blur-sm md:min-w-0"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <h3 className="heading text-xl text-[#171614] sm:text-2xl">{item.title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-[#5A5853]">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
