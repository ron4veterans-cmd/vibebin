"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { IconLogout, IconPlus } from "@/components/Icons";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/login");
      return;
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setEmail(data.user.email ?? null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", data.user.id)
        .single();

      setIsPro(profile?.subscription_status === "active");
      setReady(true);
    });
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.replace("/");
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/library" className="text-lg font-semibold tracking-tight">
              VibeBin
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/library"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/library"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Library
              </Link>
              <Link
                href="/collections"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname.startsWith("/collections")
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Collections
              </Link>
              <Link
                href="/account"
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  pathname === "/account"
                    ? "bg-surface text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                Account
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {isPro ? (
              <span className="text-xs font-medium text-accent border border-accent/30 px-2 py-0.5 rounded-full">
                Pro
              </span>
            ) : (
              <Link
                href="/upgrade"
                className="text-xs font-medium text-muted hover:text-accent transition-colors"
              >
                Upgrade
              </Link>
            )}
            <Link href="/prompts/new">
              <Button size="sm" className="gap-1.5">
                <IconPlus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </Button>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Log out">
              <IconLogout className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
