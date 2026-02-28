import Link from "next/link";
import { SectionShell } from "@/components/SectionShell";

export default function AddressesPage() {
  return (
    <main className="min-h-screen bg-white pt-24">
      <SectionShell>
        <h1 className="heading text-3xl font-bold text-[#231F20]">Addresses</h1>
        <p className="mt-2 text-[#6B6B6B]">Manage your shipping addresses.</p>
        <Link href="/account" className="mt-6 inline-block text-sm font-medium text-[#231F20] underline">
          Back to account
        </Link>
      </SectionShell>
    </main>
  );
}
