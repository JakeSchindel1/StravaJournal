import { SectionShell } from "../SectionShell";

export function MeaningSection() {
  return (
    <section className="bg-[linear-gradient(to_bottom,_#f7f4ef_0%,_#f1ece3_100%)]">
      <SectionShell>
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="heading reveal text-4xl leading-tight text-[#1A1917] sm:text-5xl md:text-6xl">
            What usually disappears,
            <br />
            stays.
          </h2>

          <p
            className="reveal mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-[#36342E]"
            style={{ animationDelay: "120ms" }}
          >
            Training often lives in feeds, charts, and timelines.
            <br />
            This gives your effort a permanent home you can hold.
          </p>
        </div>
      </SectionShell>
    </section>
  );
}
