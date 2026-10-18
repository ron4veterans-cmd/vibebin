"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePrompts } from "@/hooks/usePrompts";
import { PromptCard } from "@/components/PromptCard";
import { LimitModal } from "@/components/LimitModal";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { IconPlus, IconSearch } from "@/components/Icons";

export default function LibraryPage() {
  const { prompts, loading, count, isPro, freeLimit, limitReached, remove } =
    usePrompts();
  const [search, setSearch] = useState("");
  const [showLimit, setShowLimit] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return prompts;
    const q = search.toLowerCase();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.notes && p.notes.toLowerCase().includes(q))
    );
  }, [prompts, search]);

  const handleNew = () => {
    if (limitReached) {
      setShowLimit(true);
      return;
    }
    window.location.href = "/prompts/new";
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-muted text-sm">Loading your prompts…</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Library</h1>
          <p className="mt-1 text-sm text-muted">
            {count} prompt{count !== 1 ? "s" : ""}
            {!isPro && (
              <span>
                {" "}
                · {count}/{freeLimit} free
              </span>
            )}
          </p>
        </div>
        <Button onClick={handleNew} className="gap-1.5 self-start sm:self-auto">
          <IconPlus className="w-4 h-4" />
          New prompt
        </Button>
      </div>

      {/* Search */}
      {prompts.length > 0 && (
        <div className="relative mb-6">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="search"
            placeholder="Search prompts, tags, content…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      )}

      {/* Empty state */}
      {prompts.length === 0 && (
        <div className="border border-dashed border-border rounded-xl p-12 text-center">
          <h2 className="text-lg font-medium">No prompts yet</h2>
          <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
            Save your first prompt or agent config so you never lose it again.
          </p>
          <Button onClick={handleNew} className="mt-6 gap-1.5">
            <IconPlus className="w-4 h-4" />
            Create your first prompt
          </Button>
        </div>
      )}

      {/* Grid */}
      {filtered.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt}
              onDelete={remove}
            />
          ))}
        </div>
      )}

      {prompts.length > 0 && filtered.length === 0 && (
        <p className="text-sm text-muted text-center py-12">
          No prompts match “{search}”
        </p>
      )}

      {/* Usage bar for free users */}
      {!isPro && count > 0 && (
        <div className="mt-10 border border-border rounded-lg p-4 bg-surface">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">Free plan usage</span>
            <span>
              {count} / {freeLimit}
            </span>
          </div>
          <div className="h-1.5 bg-background rounded-full overflow-hidden">
            <div
              className="h-full bg-accent rounded-full transition-all"
              style={{
                width: `${Math.min((count / freeLimit) * 100, 100)}%`,
              }}
            />
          </div>
          {count >= freeLimit - 5 && (
            <p className="mt-2 text-xs text-muted">
              {count >= freeLimit
                ? "Limit reached. "
                : `${freeLimit - count} left. `}
              <Link href="/upgrade" className="text-accent hover:underline">
                Upgrade to Pro
              </Link>{" "}
              for unlimited.
            </p>
          )}
        </div>
      )}

      <LimitModal open={showLimit} onClose={() => setShowLimit(false)} />
    </div>
  );
}
