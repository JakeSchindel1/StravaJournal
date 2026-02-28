"use client";

/**
 * Provides current user, profile, and derived state (hasStrava, needsEmail).
 * Used by header and profile modal to show correct UI.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode
} from "react";
import { createClient } from "@/lib/supabase";
import { hasStravaConnection } from "@/lib/account-status";
import { isPlaceholderEmail } from "@/lib/profile-utils";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type UserContextValue = {
  user: User | null;
  profile: Profile | null;
  hasStrava: boolean;
  needsEmail: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasStrava, setHasStrava] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setUser(null);
      setProfile(null);
      setHasStrava(false);
      setLoading(false);
      return;
    }

    const { data: { user: u } } = await supabase.auth.getUser();
    setUser(u ?? null);

    if (!u) {
      setProfile(null);
      setHasStrava(false);
      setLoading(false);
      return;
    }

    const linked = await hasStravaConnection(u.id);
    setHasStrava(linked);

    const { data: p } = await supabase
      .from("profiles")
      .select("id, email, display_name, avatar_url")
      .eq("id", u.id)
      .single();

    setProfile(p ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchUser();

    const supabase = createClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void fetchUser();
    });

    return () => subscription.unsubscribe();
  }, [fetchUser]);

  const needsEmail = isPlaceholderEmail(profile?.email ?? user?.email);

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        hasStrava,
        needsEmail,
        loading,
        refresh: fetchUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
