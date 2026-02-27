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

      <div className="mt-14 divide-y divide-[#D6D0C4] border-y border-[#D6D0C4]">
        {qualities.map((item, index) => (
          <article
            key={item.title}
            className="reveal grid gap-3 py-7 sm:grid-cols-[1fr_2fr] sm:gap-10"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <h3 className="heading text-2xl text-[#22211E] sm:text-3xl">{item.title}</h3>
            <p className="text-base leading-relaxed text-[#3E3C36] sm:text-lg">{item.detail}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}
