"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/profile";
import { migrateLocalData, type MigrateResult } from "@/lib/migrate-local";
import { FREE_PROMPT_LIMIT, type UserProfile } from "@/types";

type AuthValue = {
  ready: boolean;
  configured: boolean;
  user: User | null;
  profile: UserProfile | null;
  isPro: boolean;
  setupError: string | null;
  importNote: string | null;
  supabase: SupabaseClient | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

function noteFromMigration(result: MigrateResult): string | null {
  if (result.limited) {
    const count = result.importedPrompts;
    return `Imported ${count} prompt${count === 1 ? "" : "s"} from this browser. The free plan holds ${FREE_PROMPT_LIMIT}; anything left stays on this device until you upgrade.`;
  }
  if (result.importedPrompts > 0) {
    const count = result.importedPrompts;
    const collections =
      result.importedCollections > 0
        ? ` and ${result.importedCollections} collection${result.importedCollections === 1 ? "" : "s"}`
        : "";
    return `Imported ${count} prompt${count === 1 ? "" : "s"}${collections} saved in this browser.`;
  }
  if (result.collectionsWaiting) {
    return "Collections saved in this browser will move over after you upgrade to Pro.";
  }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [importNote, setImportNote] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!supabase) {
        if (!cancelled) setReady(true);
        return;
      }

      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        setUser(null);
        setProfile(null);
        setReady(true);
        return;
      }

      setUser(data.user);
      const ensured = await ensureProfile(supabase, {
        id: data.user.id,
        email: data.user.email ?? null,
      });
      if (cancelled) return;
      if (!ensured.profile) {
        setProfile(null);
        setSetupError(
          ensured.error ??
            "Your profile row is missing. Run supabase/schema.sql in the Supabase SQL editor, then reload."
        );
        setReady(true);
        return;
      }

      setProfile(ensured.profile);
      setSetupError(null);
      const migrated = await migrateLocalData(
        supabase,
        data.user.id,
        ensured.profile.subscription_status === "active"
      );
      if (cancelled) return;
      setImportNote(noteFromMigration(migrated));
      setReady(true);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const refreshProfile = useCallback(async () => {
    if (!supabase || !user) return;
    const ensured = await ensureProfile(supabase, {
      id: user.id,
      email: user.email ?? null,
    });
    if (!ensured.profile) return;
    setProfile(ensured.profile);
    if (ensured.profile.subscription_status === "active") {
      const migrated = await migrateLocalData(supabase, user.id, true);
      const note = noteFromMigration(migrated);
      if (note) setImportNote(note);
    }
  }, [supabase, user]);

  useEffect(() => {
    const onFocus = () => {
      void refreshProfile();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [refreshProfile]);

  const value = useMemo<AuthValue>(
    () => ({
      ready,
      configured: Boolean(supabase),
      user,
      profile,
      isPro: profile?.subscription_status === "active",
      setupError,
      importNote,
      supabase,
      refreshProfile,
    }),
    [ready, supabase, user, profile, setupError, importNote, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
