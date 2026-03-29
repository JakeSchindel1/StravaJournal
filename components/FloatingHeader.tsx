"use client";

/**
 * Sticky header for /account page. Transparent initially; becomes frosted glass on scroll.
 * Left: brand wordmark. Right: Support link + avatar dropdown (Profile, Orders, Addresses, Billing, Sign out).
 */

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/UserContext";
import { useProfileModal } from "@/contexts/ProfileModalContext";
import { signOut } from "@/lib/supabase";

const DROPDOWN_LINKS = [
  { label: "Support", href: "/support" },
  { label: "Orders", href: "/account/orders" },
  { label: "Addresses", href: "/account/addresses" },
  { label: "Billing", href: "/account/billing" }
] as const;

export function FloatingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, profile, needsEmail, hasStrava } = useUser();
  const { openModal: openProfileModal } = useProfileModal();
  const displayName = profile?.display_name ?? user?.email ?? "Account";

  const handleAccountSettings = () => {
    setDropdownOpen(false);
    openProfileModal();
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header
      className={`fixed left-4 right-4 top-4 z-40 flex items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 md:left-1/2 md:right-auto md:top-4 md:w-full md:max-w-4xl md:-translate-x-1/2 ${
        scrolled
          ? "border border-[#E5E5E5]/80 bg-white/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.06)] backdrop-blur-xl"
          : "border border-transparent bg-transparent"
      }`}
      role="banner"
    >
      <Link
        href="/"
        className="heading text-sm font-semibold text-[#231F20] transition hover:opacity-80"
      >
        Grex
      </Link>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E5E5]/80 bg-white/90 transition hover:border-[#E5E5E5] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#231F20] focus-visible:ring-offset-2"
            aria-label={needsEmail || !hasStrava ? "Account menu – action needed" : "Account menu"}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-[#6B6B6B]">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
            {(needsEmail || !hasStrava) && (
              <span
                className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
                aria-hidden
              />
            )}
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 min-w-[180px] rounded-xl border border-[#E5E5E5]/90 bg-white/95 py-1.5 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12)] backdrop-blur-xl animate-fade-in"
              role="menu"
            >
              <button
                type="button"
                onClick={handleAccountSettings}
                className="block w-full px-4 py-2.5 text-left text-sm text-[#231F20] transition hover:bg-[#F5F5F5]"
                role="menuitem"
              >
                Account settings
              </button>
              {DROPDOWN_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2.5 text-sm text-[#231F20] transition hover:bg-[#F5F5F5]"
                  role="menuitem"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  void signOut();
                }}
                className="w-full px-4 py-2.5 text-left text-sm text-[#6B6B6B] transition hover:bg-[#F5F5F5]"
                role="menuitem"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
