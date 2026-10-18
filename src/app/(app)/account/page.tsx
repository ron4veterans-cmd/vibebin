"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLocalUser,
  setLocalUser,
  getPromptCount,
  exportPromptsJSON,
  exportPromptsMarkdown,
  downloadFile,
  type LocalUser,
} from "@/lib/store";
import { Button } from "@/components/Button";
import { FREE_PROMPT_LIMIT } from "@/types";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const u = getLocalUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    setCount(getPromptCount());
  }, [router]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  const handleExportJSON = () => {
    downloadFile(
      `vibebin-export-${new Date().toISOString().slice(0, 10)}.json`,
      exportPromptsJSON(),
      "application/json"
    );
  };

  const handleExportMarkdown = () => {
    downloadFile(
      `vibebin-export-${new Date().toISOString().slice(0, 10)}.md`,
      exportPromptsMarkdown(),
      "text/markdown"
    );
  };

  const handleDowngrade = () => {
    if (!confirm("Switch back to Free plan? (Demo only — real billing uses Stripe.)")) {
      return;
    }
    const updated = { ...user, isPro: false };
    setLocalUser(updated);
    setUser(updated);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Account</h1>

      <section className="mt-8 border border-border rounded-xl bg-surface p-5 space-y-4">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
          Profile
        </h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Email</span>
          <span>{user.email}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Plan</span>
          <span className="font-medium">
            {user.isPro ? (
              <span className="text-accent">Pro</span>
            ) : (
              "Free"
            )}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Prompts</span>
          <span>
            {count}
            {!user.isPro && ` / ${FREE_PROMPT_LIMIT}`}
          </span>
        </div>
      </section>

      <section className="mt-6 border border-border rounded-xl bg-surface p-5 space-y-4">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
          Subscription
        </h2>
        {user.isPro ? (
          <>
            <p className="text-sm text-muted">
              You have full access to unlimited prompts, collections, sharing,
              and export.
            </p>
            <Button variant="secondary" size="sm" onClick={handleDowngrade}>
              Switch to Free (demo)
            </Button>
          </>
        ) : (
          <>
            <p className="text-sm text-muted">
              Upgrade for unlimited prompts, collections, sharing, and export.
            </p>
            <Link href="/upgrade">
              <Button size="sm">Upgrade to Pro — $7/mo or $69/yr</Button>
            </Link>
          </>
        )}
      </section>

      <section className="mt-6 border border-border rounded-xl bg-surface p-5 space-y-4">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
          Export
        </h2>
        <p className="text-sm text-muted">
          Download all your prompts. Available on every plan.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={handleExportJSON}>
            Export JSON
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportMarkdown}>
            Export Markdown
          </Button>
        </div>
      </section>
    </div>
  );
}
