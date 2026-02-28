import { SectionShell } from "../SectionShell";

export function ProductConceptSection() {
  return (
    <SectionShell className="pt-14 md:pt-20">
      <p
        className="heading reveal mx-auto max-w-2xl text-center text-lg font-semibold leading-relaxed text-[#231F20] sm:text-xl"
        style={{ animationDelay: "120ms" }}
      >
        Connect your recorded activities and workouts.
        <br />
        We turn your history into one physical journal, printed and bound to keep.
      </p>
    </SectionShell>
  );
}
