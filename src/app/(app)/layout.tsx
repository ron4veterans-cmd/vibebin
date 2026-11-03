"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Button } from "@/components/Button";
import { IconLogout, IconPlus } from "@/components/Icons";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, configured, user, isPro, supabase, setupError } = useAuth();

  useEffect(() => {
    if (ready && configured && !user) {
      router.replace("/login");
    }
  }, [ready, configured, user, router]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const navClass = (path: string) =>
    pathname === path
      ? "px-3 py-1.5 rounded-md bg-surface text-foreground"
      : "px-3 py-1.5 rounded-md text-muted hover:text-foreground";

  let main: React.ReactNode;
  if (!ready) {
    main = (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  } else if (!configured) {
    main = (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16">
        <div className="border border-border rounded-xl bg-surface p-6">
          <h1 className="text-lg font-medium">Supabase is not configured</h1>
          <p className="mt-2 text-sm text-muted">
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then
            reload. Sign-in and saved prompts stay unavailable until then.
          </p>
        </div>
      </div>
    );
  } else if (!user) {
    main = (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-muted text-sm">Redirecting to sign in…</p>
      </div>
    );
  } else {
    main = (
      <>
        {setupError && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{setupError}</p>
            </div>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/library" className="text-lg font-semibold tracking-tight">
              VibeBin
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link href="/library" className={navClass("/library")}>
                Library
              </Link>
              <Link href="/collections" className={navClass("/collections")}>
                Collections
              </Link>
              <Link href="/account" className={navClass("/account")}>
                Account
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {isPro && (
              <span className="text-xs font-medium bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                Pro
              </span>
            )}
            <Link href="/upgrade">
              <Button variant="ghost" size="sm">
                Upgrade
              </Button>
            </Link>
            <Link href="/prompts/new">
              <Button size="sm">
                <IconPlus className="w-4 h-4" />
                New
              </Button>
            </Link>
            {supabase && (
              <button
                onClick={signOut}
                className="text-muted hover:text-foreground p-1.5"
                title="Sign out"
              >
                <IconLogout className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{main}</main>
    </div>
  );
}
