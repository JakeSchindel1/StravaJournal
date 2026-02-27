import { GET_STARTED_HREF } from "../getStarted";
import { SectionShell } from "../SectionShell";

export function FinalCtaSection() {
  return (
    <SectionShell id="get-started" className="text-center">
      <h2 className="heading reveal text-4xl leading-tight text-[#171614] sm:text-5xl md:text-6xl">
        A better home
        <br />
        for your training.
      </h2>

      <p
        className="reveal mx-auto mt-8 max-w-xl text-lg leading-relaxed text-[#393732]"
        style={{ animationDelay: "100ms" }}
      >
        One journal. Your history.
        <br />
        Made to be kept.
      </p>

      <a
        href={GET_STARTED_HREF}
        className="button-primary reveal mt-10"
        style={{ animationDelay: "200ms" }}
      >
        Get Started
      </a>
    </SectionShell>
  );
}
