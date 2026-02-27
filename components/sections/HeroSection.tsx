import { GetStartedButton } from "../GetStartedButton";

export function HeroSection() {
  return (
    <header className="relative flex min-h-[95vh] items-center justify-center overflow-hidden px-6 pb-16 pt-10 md:px-12 md:pb-20">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(0,0,0,0.02)_0%,_transparent_70%)]" />

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
        <p className="reveal text-[11px] font-medium uppercase tracking-[0.3em] text-[#6B6B6B] md:text-xs">
          Your Activity Journal
        </p>

        <h1 className="heading reveal mt-5 max-w-4xl text-5xl leading-[1.02] text-[#231F20] sm:text-6xl md:text-7xl lg:text-8xl">
          A better home
          <br />
          for your training.
        </h1>

        <p
          className="reveal mt-7 max-w-2xl text-base leading-relaxed text-[#231F20]/80 sm:text-lg"
          style={{ animationDelay: "120ms" }}
        >
          One journal. Your history. Made to be kept.
        </p>

        <div id="get-started-anchor" className="mt-10">
          <GetStartedButton />
        </div>
      </div>
    </header>
  );
}
