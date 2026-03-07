import { Suspense } from "react";
import { CallbackClient } from "./CallbackClient";

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center">
          <h1 className="heading text-3xl text-[#231F20]">Signing you in</h1>
          <p className="mt-3 text-base text-[#6B6B6B]">Finalizing sign-in...</p>
        </main>
      }
    >
      <CallbackClient />
    </Suspense>
  );
}
