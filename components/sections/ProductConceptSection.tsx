import { SectionShell } from "../SectionShell";

export function ProductConceptSection() {
  return (
    <SectionShell className="pt-14 md:pt-20">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <h2 className="heading reveal text-4xl leading-tight text-[#231F20] sm:text-5xl md:text-6xl">
          A singular object,
          <br />
          built from your activity history.
        </h2>

        <p
          className="reveal max-w-xl text-lg leading-relaxed text-[#231F20]/80"
          style={{ animationDelay: "120ms" }}
        >
          Connect your recorded activities and workouts.
          <br />
          We turn your history into one physical journal, printed and bound to keep.
        </p>
      </div>
    </SectionShell>
  );
}
