"use client";

/**
 * Profile modal - account management when logged in.
 * Log out, disconnect Strava, add email (for Strava users), delete account.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";
import { useProfileModal } from "@/contexts/ProfileModalContext";
import { signOut } from "@/lib/supabase";
import { connectStravaAuth } from "@/lib/strava/client";

export function ProfileModal() {
  const { isOpen, closeModal } = useProfileModal();
  const { user, profile, hasStrava, needsEmail, refresh } = useUser();
  const [emailInput, setEmailInput] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [clearLoading, setClearLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setEmailError(null);
    setDeleteConfirm(false);
    closeModal();
  }, [closeModal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleClose]);

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    if (!emailInput.trim()) return;
    setEmailLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setEmailInput("");
      await refresh();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDisconnectStrava = async () => {
    setDisconnectLoading(true);
    try {
      const res = await fetch("/api/profile/disconnect-strava", { method: "POST" });
      if (!res.ok) throw new Error("Failed to disconnect");
      await refresh();
    } catch {
      setEmailError("Failed to disconnect Strava");
    } finally {
      setDisconnectLoading(false);
    }
  };

  const handleClearPersonalInfo = async () => {
    setClearLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: null, avatar_url: null })
      });
      if (!res.ok) throw new Error("Failed to clear");
      await refresh();
    } catch {
      setEmailError("Failed to clear personal info");
    } finally {
      setClearLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch("/api/profile/delete", { method: "POST" });
      if (!res.ok) throw new Error("Failed to delete");
      await signOut();
    } catch {
      setEmailError("Failed to delete account");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  const displayName = profile?.display_name ?? user.email ?? "Account";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#231F20]/40 p-4 sm:p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-xl sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E5E5E5] text-lg font-semibold text-[#6B6B6B]">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 id="profile-modal-title" className="heading text-xl text-[#231F20]">
                {displayName}
              </h2>
              <p className="text-sm text-[#6B6B6B]">
                {profile?.email ?? user.email ?? "No email"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1.5 text-[#6B6B6B] transition hover:bg-[#F0F0F0] hover:text-[#231F20]"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {emailError && (
          <p className="mb-4 text-sm text-amber-700">{emailError}</p>
        )}

        {/* Incomplete profile: Strava user needs to add email */}
        {needsEmail && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-800">Complete your profile</p>
            <p className="mt-1 text-sm text-amber-700">
              Add your email so we can reach you and keep your account secure.
            </p>
            <form onSubmit={handleUpdateEmail} className="mt-3 flex gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm focus:border-[#231F20] focus:outline-none focus:ring-1 focus:ring-[#231F20]"
                disabled={emailLoading}
              />
              <button
                type="submit"
                disabled={emailLoading || !emailInput.trim()}
                className="button-primary px-4 py-2 text-sm"
              >
                {emailLoading ? "Saving…" : "Add"}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {hasStrava ? (
            <button
              type="button"
              onClick={handleDisconnectStrava}
              disabled={disconnectLoading}
              className="w-full rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-left text-sm text-[#6B6B6B] transition hover:bg-[#F5F5F5] disabled:opacity-50"
            >
              {disconnectLoading ? "Disconnecting…" : "Disconnect Strava"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => connectStravaAuth("/account")}
              className="w-full rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-left text-sm text-[#231F20] transition hover:bg-[#F5F5F5]"
            >
              Connect Strava
            </button>
          )}

          {(profile?.display_name || profile?.avatar_url) && (
            <button
              type="button"
              onClick={handleClearPersonalInfo}
              disabled={clearLoading}
              className="w-full rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-left text-sm text-[#6B6B6B] transition hover:bg-[#F5F5F5] disabled:opacity-50"
            >
              {clearLoading ? "Clearing…" : "Clear personal info"}
            </button>
          )}

          <button
            type="button"
            onClick={() => signOut()}
            className="w-full rounded-lg border border-[#E5E5E5] px-4 py-2.5 text-left text-sm text-[#6B6B6B] transition hover:bg-[#F5F5F5]"
          >
            Log out
          </button>

          <div className="pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              className={`w-full rounded-lg px-4 py-2.5 text-left text-sm transition disabled:opacity-50 ${
                deleteConfirm
                  ? "bg-red-50 text-red-700 hover:bg-red-100"
                  : "text-[#6B6B6B] hover:bg-[#F5F5F5]"
              }`}
            >
              {deleteConfirm
                ? "Click again to permanently delete your account"
                : "Delete account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
