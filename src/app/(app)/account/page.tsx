"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { usePrompts } from "@/hooks/usePrompts";
import { downloadFile, promptsToJSON, promptsToMarkdown } from "@/lib/export";
import { Button } from "@/components/Button";
import { FREE_PROMPT_LIMIT } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AccountPage() {
  const { user, profile, isPro } = useAuth();
  const { prompts, count, loading } = usePrompts();

  if (loading || !user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  const planLabel = isPro
    ? profile?.subscription_plan === "yearly"
      ? "Pro · Yearly"
      : profile?.subscription_plan === "monthly"
        ? "Pro · Monthly"
        : "Pro"
    : profile?.subscription_status === "past_due"
      ? "Past due"
      : "Free";

  const handleExportJSON = () => {
    downloadFile(
      `vibebin-export-${new Date().toISOString().slice(0, 10)}.json`,
      promptsToJSON(prompts),
      "application/json"
    );
  };

  const handleExportMarkdown = () => {
    downloadFile(
      `vibebin-export-${new Date().toISOString().slice(0, 10)}.md`,
      promptsToMarkdown(prompts),
      "text/markdown"
    );
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
          <span>{user.email || "Google account"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Plan</span>
          <span className="font-medium">
            {isPro ? <span className="text-accent">{planLabel}</span> : planLabel}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Prompts</span>
          <span>
            {count}
            {!isPro && ` / ${FREE_PROMPT_LIMIT}`}
          </span>
        </div>
        {profile?.current_period_end && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Current period ends</span>
            <span>{formatDate(profile.current_period_end)}</span>
          </div>
        )}
      </section>

      <section className="mt-6 border border-border rounded-xl bg-surface p-5 space-y-4">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide">
          Subscription
        </h2>
        {isPro ? (
          <p className="text-sm text-muted">
            You have full access to unlimited prompts and collections. Paddle
            updates this plan when the subscription changes.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted">
              {profile?.subscription_status === "past_due"
                ? "Payment is past due, so the free prompt limit applies until Paddle marks the subscription active."
                : "Upgrade for unlimited prompts and collections."}
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
