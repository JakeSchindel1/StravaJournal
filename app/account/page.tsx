"use client";

/**
 * Premium purchase portal for journals. Authenticated page.
 * Hero, stats, journals list, create journal flow.
 */

import { Suspense, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SectionShell } from "@/components/SectionShell";
import { Footer } from "@/components/Footer";
import { AccountHero } from "@/components/account/AccountHero";
import { JournalCard } from "@/components/account/JournalCard";
import { CreateJournalCard } from "@/components/account/CreateJournalCard";
import { JournalBuilderModal } from "@/components/account/JournalBuilderModal";
import { useUser } from "@/contexts/UserContext";
import { useProfileModal } from "@/contexts/ProfileModalContext";
import { MOCK_JOURNALS, journalFromDraft, type Journal } from "@/lib/mock-journals";
import type { JournalDraft } from "@/lib/journal-draft";
import { track } from "@/lib/analytics/posthog";
import { SITE_EMAIL } from "@/lib/site-emails";

type BuilderSource = "hero_cta" | "create_tile" | "other";

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, needsEmail, hasStrava } = useUser();
  const { openModal: openProfileModal } = useProfileModal();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderSource, setBuilderSource] = useState<BuilderSource>("other");
  const [journals, setJournals] = useState<Journal[]>(MOCK_JOURNALS);
  const accountViewedRef = useRef(false);

  const openBuilder = (source: BuilderSource) => {
    setBuilderSource(source);
    setBuilderOpen(true);
  };

  const handleBuilderComplete = (draft: JournalDraft) => {
    const id = `draft-${Date.now()}`;
    setJournals((prev) => [journalFromDraft(draft, id), ...prev]);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  // account_page_viewed: fire once when page loads with user
  useEffect(() => {
    if (!loading && user && !accountViewedRef.current) {
      accountViewedRef.current = true;
      track("account_page_viewed", { has_existing_journals: journals.length > 0 });
    }
  }, [loading, user, journals.length]);

  const error = searchParams.get("error");
  const errorMessage =
    error === "strava_already_linked"
      ? "This Strava account is already linked to another account. If you have multiple accounts, sign in to the one that originally connected Strava, or disconnect Strava from that account first."
      : error === "strava_auth_failed"
        ? "Strava connection failed. Please try again."
        : null;

  if (loading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="heading text-3xl text-[#231F20]">Loading</h1>
        <p className="mt-3 text-base text-[#6B6B6B]">Checking your account...</p>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-white">
      {errorMessage && (
        <div className="mx-auto max-w-xl px-6 py-4 text-center">
          <p className="text-sm text-amber-700">{errorMessage}</p>
        </div>
      )}
      {!hasStrava && (
        <div className="mx-auto max-w-xl px-6 py-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Connect Strava</p>
            <p className="mt-1 text-sm text-amber-700">
              Connect your Strava account to build journals from your training data.{" "}
              <button
                type="button"
                onClick={openProfileModal}
                className="font-medium underline hover:no-underline"
              >
                Open account settings
              </button>
            </p>
          </div>
        </div>
      )}
      {needsEmail && (
        <div className="mx-auto max-w-xl px-6 py-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
            <p className="mt-1 text-sm text-amber-700">
              Add your email to keep your account secure.{" "}
              <button
                type="button"
                onClick={openProfileModal}
                className="font-medium underline hover:no-underline"
              >
                Open account settings
              </button>
            </p>
          </div>
        </div>
      )}
      <AccountHero onCreateJournal={() => openBuilder("hero_cta")} />

      <SectionShell className="bg-white">
        <div className="mb-8">
          <h2 className="heading text-3xl font-bold text-[#231F20] sm:text-4xl">
            Create your journal
          </h2>
          <p className="mt-2 text-base text-[#6B6B6B]">
            Build, preview, and order your training journal.
          </p>
        </div>

        <div className="space-y-4">
          {journals.map((journal) => (
            <JournalCard
              key={journal.id}
              journal={journal}
              onContinue={(id) => {
                // TODO: Navigate to journal editor or continue flow
                console.log("Continue journal:", id);
              }}
            />
          ))}
          <CreateJournalCard onCreate={() => openBuilder("create_tile")} />
        </div>

        {/* Keep privacy controls inside account so users can quickly manage their data rights. */}
        <div className="mt-10 rounded-xl border border-[#E7E4E4] bg-[#FAFAFA] p-5">
          <h3 className="heading text-xl font-semibold text-[#231F20]">Data &amp; Privacy</h3>
          <p className="mt-2 text-sm text-[#6B6B6B]">
            Review how your data is used, or request export/deletion by emailing{" "}
            <a href={`mailto:${SITE_EMAIL.privacy}`} className="underline">
              {SITE_EMAIL.privacy}
            </a>
            .
          </p>
          <Link href="/privacy" className="mt-3 inline-block text-sm font-medium text-[#231F20] underline">
            View Privacy Policy
          </Link>
        </div>
      </SectionShell>

      <Footer />

      <JournalBuilderModal
        open={builderOpen}
        source={builderSource}
        onClose={() => setBuilderOpen(false)}
        onComplete={handleBuilderComplete}
      />
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="heading text-3xl text-[#231F20]">Loading</h1>
          <p className="mt-3 text-base text-[#6B6B6B]">Checking your account...</p>
        </main>
      }
    >
      <AccountContent />
    </Suspense>
  );
}
