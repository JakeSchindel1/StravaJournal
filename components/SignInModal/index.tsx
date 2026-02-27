"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase";
import type { SignInModalAuthHandlers } from "./types";

/** Builds email handlers, falling back to Supabase when authHandlers omit them (for backward compatibility). */
function buildEmailHandlers(authHandlers: SignInModalAuthHandlers): SignInModalAuthHandlers {
  return {
    onEmailSignup:
      authHandlers.onEmailSignup ??
      (async (email, password) => {
        const supabase = createClient();
        if (!supabase) throw new Error("Authentication is not configured.");
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
      }),
    onEmailSignin:
      authHandlers.onEmailSignin ??
      (async (email, password) => {
        const supabase = createClient();
        if (!supabase) throw new Error("Authentication is not configured.");
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      })
  };
}
import { AuthButton } from "./AuthButton";
import { StravaIcon } from "./StravaIcon";
import { GoogleIcon } from "./GoogleIcon";
import { EmailAuthForm } from "./EmailAuthForm";
import type { AuthLoadingSource } from "./types";

type AuthMode = "signup" | "signin";

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Optional: wire these when connecting Supabase. When omitted, falls back to direct Supabase calls if configured. */
  authHandlers?: SignInModalAuthHandlers;
};

export function SignInModal({ isOpen, onClose, authHandlers = {} }: SignInModalProps) {
  const [mode, setMode] = useState<AuthMode>("signup");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loadingSource, setLoadingSource] = useState<AuthLoadingSource>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const resetState = useCallback(() => {
    setError(null);
    setLoadingSource(null);
    setShowEmailForm(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  // Escape to close
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

  // Focus trap: focus first focusable when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const focusable = modalRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [isOpen]);

  const runAuth = async (
    source: AuthLoadingSource,
    handler: (() => Promise<void>) | undefined,
    fallback?: () => Promise<void>
  ) => {
    setError(null);
    setLoadingSource(source);
    try {
      const fn = handler ?? fallback;
      if (fn) {
        await fn();
        handleClose();
      } else {
        setError(
          source === "strava"
            ? "Strava sign-in will be available when the app is configured."
            : "Sign-in will be available when the app is configured."
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoadingSource(null);
    }
  };

  const handleStravaAuth = useCallback(async () => {
    if (authHandlers.onStravaAuth) {
      await runAuth("strava", authHandlers.onStravaAuth);
    } else {
      // Placeholder: Strava OAuth will be wired when backend is ready
      setError("Strava sign-in will be available soon. Connect your Supabase project to enable it.");
    }
  }, [authHandlers.onStravaAuth]);

  const handleGoogleAuth = useCallback(async () => {
    if (authHandlers.onGoogleAuth) {
      await runAuth("google", authHandlers.onGoogleAuth);
    } else {
      // Fallback: try direct Supabase if configured (preserves existing behavior)
      const supabase = createClient();
      if (supabase) {
        await runAuth("google", undefined, async () => {
          const { error: err } = await supabase.auth.signInWithOAuth({ provider: "google" });
          if (err) throw err;
        });
      } else {
        setError("Google sign-in will be available when the app is configured.");
      }
    }
  }, [authHandlers.onGoogleAuth]);

  const handleEmailSuccess = useCallback(() => {
    handleClose();
  }, [handleClose]);

  const loading = loadingSource !== null;
  const stravaLoading = loadingSource === "strava";
  const googleLoading = loadingSource === "google";
  const emailLoading = loadingSource === "email";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      aria-describedby="signin-modal-desc"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-[#D6D0C4] bg-[#F7F4EF] p-8 shadow-float sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h2 id="signin-modal-title" className="heading text-2xl text-[#171614] sm:text-3xl">
              Create your journal
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1.5 text-[#5A5853] transition hover:bg-[#E8E3D8] hover:text-[#171614] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p id="signin-modal-desc" className="text-[#5A5853] text-base leading-relaxed">
            Link your activity data to build a personalized journal.
          </p>
        </div>

        {/* Primary: Strava */}
        <div className="space-y-4">
          <AuthButton
            onClick={handleStravaAuth}
            disabled={loading}
            variant="primary"
            icon={<StravaIcon />}
          >
            {stravaLoading ? "Connecting…" : "Continue with Strava"}
          </AuthButton>

          {/* Secondary: Google */}
          <AuthButton
            onClick={handleGoogleAuth}
            disabled={loading}
            variant="secondary"
            icon={<GoogleIcon />}
          >
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </AuthButton>
        </div>

        {/* Email option: collapsed by default, expands on click */}
        <div className="mt-8">
          {showEmailForm ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setError(null);
                }}
                className="mb-4 text-sm text-[#5A5853] hover:text-[#171614] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-offset-2 rounded"
              >
                ← Use Strava or Google instead
              </button>
              <EmailAuthForm
                mode={mode}
                onModeToggle={() => setMode((m) => (m === "signup" ? "signin" : "signup"))}
                loading={emailLoading}
                error={error}
                onError={setError}
                onLoadingChange={(loading) => setLoadingSource(loading ? "email" : null)}
                handlers={buildEmailHandlers(authHandlers)}
                onSuccess={handleEmailSuccess}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4" aria-hidden>
                <div className="h-px flex-1 bg-[#D6D0C4]" />
                <span className="text-sm text-[#8D877A]">or</span>
                <div className="h-px flex-1 bg-[#D6D0C4]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setShowEmailForm(true);
                  }}
                  className="text-sm font-medium text-[#171614] hover:text-[#3B3A36] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-offset-2 rounded"
                >
                  Sign up with email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setShowEmailForm(true);
                  }}
                  className="text-sm text-[#8D877A] hover:text-[#5A5853] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#141414] focus-visible:ring-offset-2 rounded"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
