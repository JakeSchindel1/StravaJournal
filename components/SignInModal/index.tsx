"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { signInWithEmail, signInWithOAuth, signUpWithEmail } from "@/lib/supabase";
import { startStravaAuth } from "@/lib/strava/client";
import type { SignInModalAuthHandlers } from "./types";
import { AuthButton } from "./AuthButton";
import { StravaIcon } from "./StravaIcon";
import { GoogleIcon } from "./GoogleIcon";
import { EmailAuthForm } from "./EmailAuthForm";
import type { AuthLoadingSource } from "./types";

/** Builds email handlers, falling back to Supabase when authHandlers omit them (for backward compatibility). */
function buildEmailHandlers(authHandlers: SignInModalAuthHandlers): SignInModalAuthHandlers {
  return {
    onEmailSignup: authHandlers.onEmailSignup ?? signUpWithEmail,
    onEmailSignin: authHandlers.onEmailSignin ?? signInWithEmail
  };
}

type AuthMode = "signup" | "signin";

type SignInModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Initial mode when modal opens (e.g. "signin" when opened from header) */
  initialMode?: AuthMode;
  /** When true (e.g. from "Sign in" button), skip social options and show email form directly */
  initialShowEmailForm?: boolean;
  /** Optional: wire these when connecting Supabase. When omitted, falls back to direct Supabase calls if configured. */
  authHandlers?: SignInModalAuthHandlers;
};

export function SignInModal({ isOpen, onClose, initialMode = "signup", initialShowEmailForm = false, authHandlers = {} }: SignInModalProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showEmailForm, setShowEmailForm] = useState(initialShowEmailForm);
  const [loadingSource, setLoadingSource] = useState<AuthLoadingSource>(null);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setShowEmailForm(initialShowEmailForm);
    }
  }, [isOpen, initialMode, initialShowEmailForm]);

  const resetState = useCallback(() => {
    setError(null);
    setLoadingSource(null);
    setShowEmailForm(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

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
    await runAuth("strava", authHandlers.onStravaAuth, async () => {
      // Custom Strava OAuth flow (outside Supabase provider list)
      startStravaAuth("/profile");
    });
  }, [authHandlers.onStravaAuth]);

  const handleGoogleAuth = useCallback(async () => {
    await runAuth("google", authHandlers.onGoogleAuth, async () => {
      await signInWithOAuth("google");
    });
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#231F20]/40 p-4 sm:p-6"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
      aria-describedby="signin-modal-desc"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-float sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-8">
          <div className="mb-2 flex items-start justify-between gap-4">
            <h2 id="signin-modal-title" className="heading text-2xl text-[#231F20] sm:text-3xl">
              Create your journal
            </h2>
            <button
              type="button"
              onClick={handleClose}
              className="rounded-full p-1.5 text-[#6B6B6B] transition hover:bg-[#F0F0F0] hover:text-[#231F20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2"
              aria-label="Close modal"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p id="signin-modal-desc" className="text-[#6B6B6B] text-base leading-relaxed">
            Link your activity data to build a personalized journal.
          </p>
        </div>

        <div className="space-y-4">
          <AuthButton onClick={handleStravaAuth} disabled={loading} variant="primary" icon={<StravaIcon />}>
            {stravaLoading ? "Connecting…" : "Continue with Strava"}
          </AuthButton>

          <AuthButton onClick={handleGoogleAuth} disabled={loading} variant="secondary" icon={<GoogleIcon />}>
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </AuthButton>
        </div>

        <div className="mt-8">
          {showEmailForm ? (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  setShowEmailForm(false);
                  setError(null);
                }}
                className="mb-4 text-sm text-[#6B6B6B] hover:text-[#231F20] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 rounded"
              >
                ← Use Strava or Google instead
              </button>
              <EmailAuthForm
                mode={mode}
                onModeToggle={() => setMode((m) => (m === "signup" ? "signin" : "signup"))}
                loading={emailLoading}
                error={error}
                onError={setError}
                onLoadingChange={(isLoading) => setLoadingSource(isLoading ? "email" : null)}
                handlers={buildEmailHandlers(authHandlers)}
                onSuccess={handleEmailSuccess}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4" aria-hidden>
                <div className="h-px flex-1 bg-[#E5E5E5]" />
                <span className="text-sm text-[#8D877A]">or</span>
                <div className="h-px flex-1 bg-[#E5E5E5]" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setShowEmailForm(true);
                  }}
                  className="text-sm font-medium text-[#231F20] hover:text-[#231F20]/80 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 rounded"
                >
                  Sign up with email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signin");
                    setShowEmailForm(true);
                  }}
                  className="text-sm text-[#8D877A] hover:text-[#6B6B6B] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 rounded"
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
