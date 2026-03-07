"use client";

/**
 * Empty state for profile view. Prompts to connect Strava or manage account.
 */

type ProfileEmptyStateProps = {
  hasStrava: boolean;
  onOpenProfile: () => void;
};

export function ProfileEmptyState({ hasStrava, onOpenProfile }: ProfileEmptyStateProps) {
  return (
    <main className="mx-auto flex min-h-[50vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="heading text-3xl text-[#231F20]">Your profile</h1>
      <p className="mt-3 text-base text-[#6B6B6B]">
        {hasStrava
          ? "Manage your account settings and connected services."
          : "Connect Strava to build journals from your training data."}
      </p>
      <button
        type="button"
        onClick={onOpenProfile}
        className="button-primary mt-6"
      >
        {hasStrava ? "Account settings" : "Connect Strava"}
      </button>
    </main>
  );
}
