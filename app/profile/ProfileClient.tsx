"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProfileEmptyState } from "@/components/ProfileEmptyState";
import { useUser } from "@/contexts/UserContext";
import { useProfileModal } from "@/contexts/ProfileModalContext";

type Status = "loading" | "unauthenticated" | "ready";

export function ProfileClient() {
  const router = useRouter();
  const params = useSearchParams();
  const { user, loading: userLoading, hasStrava, needsEmail, refresh } = useUser();
  const { openModal: openProfileModal } = useProfileModal();
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setStatus("unauthenticated");
      return;
    }
    setStatus("ready");
  }, [user, userLoading]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  // Refresh when returning from Strava OAuth
  useEffect(() => {
    void refresh();
  }, [params, refresh]);

  if (userLoading || status === "loading") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
        <h1 className="heading text-3xl text-[#231F20]">Loading</h1>
        <p className="mt-3 text-base text-[#6B6B6B]">Checking your account...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const error = params.get("error");
  const errorMessage =
    error === "strava_already_linked"
      ? "This Strava account is already linked to another account. If you have multiple accounts, sign in to the one that originally connected Strava, or disconnect Strava from that account first."
      : error === "strava_auth_failed"
        ? "Strava connection failed. Please try again."
        : null;

  return (
    <>
      {errorMessage && (
        <div className="mx-auto max-w-xl px-6 py-4 text-center">
          <p className="text-sm text-amber-700">{errorMessage}</p>
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
      <ProfileEmptyState hasStrava={hasStrava} onOpenProfile={openProfileModal} />
    </>
  );
}
