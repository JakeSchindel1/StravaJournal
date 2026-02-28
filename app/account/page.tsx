"use client";

/**
 * Premium purchase portal for journals. Authenticated page.
 * Hero, stats, journals list, create journal flow.
 */

import { Suspense, useState, useEffect } from "react";
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

function AccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, needsEmail, hasStrava } = useUser();
  const { openModal: openProfileModal } = useProfileModal();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [journals, setJournals] = useState<Journal[]>(MOCK_JOURNALS);

  const handleBuilderComplete = (draft: JournalDraft) => {
    const id = `draft-${Date.now()}`;
    setJournals((prev) => [journalFromDraft(draft, id), ...prev]);
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/");
    }
  }, [user, loading, router]);

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
      <AccountHero onCreateJournal={() => setBuilderOpen(true)} />

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
          <CreateJournalCard onCreate={() => setBuilderOpen(true)} />
        </div>
      </SectionShell>

      <Footer />

      <JournalBuilderModal
        open={builderOpen}
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
