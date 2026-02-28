"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";

type CallbackStatus = "loading" | "error";

export function CallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>("loading");
  const [message, setMessage] = useState("Finalizing sign-in...");

  const nextPath = useMemo(() => {
    const next = params.get("next");
    if (!next || !next.startsWith("/")) return "/";
    return next;
  }, [params]);

  useEffect(() => {
    const run = async () => {
      const explicitError = params.get("error_description") ?? params.get("error");
      if (explicitError) {
        setStatus("error");
        setMessage(explicitError);
        return;
      }

      const supabase = createClient();
      if (!supabase) {
        setStatus("error");
        setMessage("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        return;
      }

      const code = params.get("code");
      if (!code) {
        setStatus("error");
        setMessage("Missing OAuth code. Please restart sign-in.");
        return;
      }

      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      router.replace(nextPath);
    };

    void run();
  }, [nextPath, params, router]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <h1 className="heading text-3xl text-[#231F20]">{status === "loading" ? "Signing you in" : "Auth failed"}</h1>
      <p className="mt-3 text-base text-[#6B6B6B]">{message}</p>
      {status === "error" && (
        <Link href="/" className="button-primary mt-6 inline-block">
          Back to home
        </Link>
      )}
    </main>
  );
}
