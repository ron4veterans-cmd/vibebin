"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrompts } from "@/hooks/usePrompts";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { LimitModal } from "@/components/LimitModal";

export default function NewPromptPage() {
  const router = useRouter();
  const { add, limitReached, canCreate } = usePrompts();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showLimit, setShowLimit] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!content.trim()) {
      setError("Prompt content is required");
      return;
    }

    if (!canCreate) {
      setShowLimit(true);
      return;
    }

    setSaving(true);
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await add({
      title: title.trim(),
      content: content.trim(),
      notes: notes.trim() || null,
      tags,
      is_agent_config: isAgent,
    });

    setSaving(false);

    if (result && "error" in result) {
      if (result.error === "FREE_LIMIT_REACHED") {
        setShowLimit(true);
      } else {
setError(result.error || "Something went wrong");
      }
      return;
    }

    router.push("/library");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">
        New prompt
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="title"
          label="Title"
          placeholder="e.g. System prompt for code review"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          id="content"
          label="Prompt / Agent config"
          placeholder="Paste your prompt or agent configuration here…"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          required
        />

        <Input
          id="tags"
          label="Tags (comma-separated)"
          placeholder="coding, agents, review"
          value={tagsRaw}
          onChange={(e) => setTagsRaw(e.target.value)}
        />

        <Textarea
          id="notes"
          label="Notes (optional)"
          placeholder="When to use this, what works well, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="font-sans min-h-[80px]"
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isAgent}
            onChange={(e) => setIsAgent(e.target.checked)}
            className="rounded border-border bg-background text-accent focus:ring-accent"
          />
          This is an agent config
        </label>

        {error && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
            <p className="text-sm font-medium text-destructive">Could not save</p>
            <p className="mt-1 text-xs text-destructive/90 break-words">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save prompt"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/library")}
          >
            Cancel
          </Button>
        </div>
      </form>

      <LimitModal open={showLimit} onClose={() => setShowLimit(false)} />
    </div>
  );
}
