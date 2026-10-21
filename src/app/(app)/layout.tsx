"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/Button";
import { IconLogout, IconPlus } from "@/components/Icons";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      setEmail(user.email || null);

      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();

      setIsPro(profile?.subscription_status === "active");
    });
  }, [router]);

  const signOut = async () => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/library" className="text-lg font-semibold tracking-tight">
              VibeBin
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              <Link
                href="/library"
                className={`px-3 py-1.5 rounded-md ${pathname === "/library" ? "bg-surface 
text-foreground" : "text-muted hover:text-foreground"}`}
              >
                Library
              </Link>
              <Link
                href="/collections"
                className={`px-3 py-1.5 rounded-md ${pathname.startsWith("/collections") ? "bg-surface 
text-foreground" : "text-muted hover:text-foreground"}`}
              >
                Collections
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
            <button onClick={signOut} className="text-muted hover:text-foreground p-1.5" title="Sign 
out">
              <IconLogout className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
