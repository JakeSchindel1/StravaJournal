"use client";

import { useState } from "react";
import { PasswordStrength } from "./PasswordStrength";
import type { SignInModalAuthHandlers } from "./types";

type AuthMode = "signup" | "signin";

type EmailAuthFormProps = {
  mode: AuthMode;
  onModeToggle: () => void;
  loading: boolean;
  error: string | null;
  onError: (msg: string | null) => void;
  onLoadingChange: (loading: boolean) => void;
  handlers: SignInModalAuthHandlers;
  onSuccess: () => void;
};

export function EmailAuthForm({
  mode,
  onModeToggle,
  loading,
  error,
  onError,
  onLoadingChange,
  handlers,
  onSuccess
}: EmailAuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    onError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onError(null);

    if (mode === "signup" && password !== confirmPassword) {
      onError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      onError("Password must be at least 6 characters");
      return;
    }

    const handler = mode === "signup" ? handlers.onEmailSignup : handlers.onEmailSignin;
    if (!handler) {
      onError("Email sign-in will be available when the app is configured.");
      return;
    }

    onLoadingChange(true);
    try {
      await handler(email, password);
      onSuccess();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      onLoadingChange(false);
    }
  };

  const inputBase =
    "w-full rounded-xl border border-[#E5E5E5] bg-white px-4 py-3 text-[#231F20] placeholder:text-[#8D877A] transition focus:border-[#231F20] focus:outline-none focus:ring-1 focus:ring-[#231F20]/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="modal-email" className="mb-1.5 block text-sm font-medium text-[#231F20]">
          Email
        </label>
        <input
          id="modal-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className={inputBase}
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label htmlFor="modal-password" className="mb-1.5 block text-sm font-medium text-[#231F20]">
          Password
        </label>
        <input
          id="modal-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          className={inputBase}
          placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
        />
        {mode === "signup" && <PasswordStrength password={password} />}
      </div>
      {mode === "signup" && (
        <div>
          <label htmlFor="modal-confirm" className="mb-1.5 block text-sm font-medium text-[#231F20]">
            Confirm password
          </label>
          <input
            id="modal-confirm"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className={inputBase}
            placeholder="Repeat password"
          />
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="button-primary w-full disabled:opacity-50"
      >
        {loading ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
      </button>
      <p className="text-center text-sm text-[#6B6B6B]">
        {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            onModeToggle();
            resetForm();
          }}
          className="font-medium text-[#231F20] underline underline-offset-2 hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2 rounded"
        >
          {mode === "signup" ? "Sign in" : "Sign up"}
        </button>
      </p>
    </form>
  );
}
