import Link from "next/link";
import { SectionShell } from "@/components/SectionShell";

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <SectionShell>
        <h1 className="heading text-3xl font-bold text-[#231F20]">How it works</h1>
        <p className="mt-4 max-w-2xl text-[#6B6B6B]">
          Connect your Strava, choose your date range and cover style, and we&apos;ll design a beautiful
          physical journal from your training history. Preview it, then order—we print and ship to you.
        </p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-[#231F20] underline">
          Create your journal
        </Link>
      </SectionShell>
    </main>
  );
}
