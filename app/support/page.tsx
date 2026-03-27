import Link from "next/link";
import { SectionShell } from "@/components/SectionShell";
import { SITE_EMAIL } from "@/lib/site-emails";

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <SectionShell>
        <h1 className="heading text-3xl font-bold text-[#231F20]">Support</h1>
        <p className="mt-2 text-[#6B6B6B]">
          How can we help? Contact us at{" "}
          <a href={`mailto:${SITE_EMAIL.support}`} className="underline">
            {SITE_EMAIL.support}
          </a>
        </p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-[#231F20] underline">
          Back to account
        </Link>
      </SectionShell>
    </main>
  );
}
