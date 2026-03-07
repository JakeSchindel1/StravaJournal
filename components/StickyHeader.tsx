"use client";

import { useState, useEffect } from "react";
import { useAuthModal } from "@/contexts/AuthModalContext";
import { useAuthHaptics } from "@/hooks/useAuthHaptics";
import { useUser } from "@/contexts/UserContext";
import { useProfileModal } from "@/contexts/ProfileModalContext";

const GET_STARTED_ANCHOR_ID = "get-started-anchor";

export function StickyHeader() {
  const [isVisible, setIsVisible] = useState(false);
  const { openModal } = useAuthModal();
  const { triggerAuthTap } = useAuthHaptics();
  const { user, profile, loading, needsEmail, hasStrava } = useUser();
  const { openModal: openProfileModal } = useProfileModal();

  useEffect(() => {
    const anchor = document.getElementById(GET_STARTED_ANCHOR_ID);
    if (!anchor) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-10px 0px 0px 0px" }
    );

    observer.observe(anchor);
    return () => observer.disconnect();
  }, []);

  const displayName = profile?.display_name ?? user?.email ?? "Account";

  return (
    <header
      className={`fixed left-4 right-4 top-4 z-40 flex items-center justify-between rounded-full px-6 py-2 backdrop-blur-xl bg-white/90 border border-[#E5E5E5]/80 shadow-sm transition-opacity duration-500 ease-out md:left-1/2 md:right-auto md:top-5 md:w-full md:max-w-4xl md:-translate-x-1/2 ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      role="banner"
      aria-hidden={!isVisible}
    >
      <span className="heading text-sm font-semibold text-[#231F20] sm:text-base">Activity Journal</span>
      <div className="flex items-center gap-2">
        {!loading && user ? (
          <button
            type="button"
            onClick={openProfileModal}
            className="relative flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-[#231F20] hover:bg-[#F0F0F0] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2"
            aria-label={needsEmail || !hasStrava ? "Open profile – action needed" : "Open profile"}
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-7 w-7 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E5E5E5] text-xs font-semibold text-[#6B6B6B]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            {(needsEmail || !hasStrava) && (
              <span
                className="absolute left-5 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white sm:left-6"
                aria-hidden
              />
            )}
            <span className="hidden sm:inline">
              {profile?.display_name ?? (user?.email ? user.email.split("@")[0] : "Account")}
            </span>
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => {
                triggerAuthTap();
                openModal("signin");
              }}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-[#231F20] hover:bg-[#F0F0F0] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => {
                triggerAuthTap();
                openModal("signup");
              }}
              className="button-primary py-1.5 px-4 text-sm"
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </header>
  );
}
