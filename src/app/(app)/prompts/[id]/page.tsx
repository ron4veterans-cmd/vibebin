"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { usePrompts } from "@/hooks/usePrompts";
import type { Prompt } from "@/types";
import { Input } from "@/components/Input";
import { Textarea } from "@/components/Textarea";
import { Button } from "@/components/Button";
import { formatDate } from "@/lib/utils";
import { IconCopy, IconCheck, IconTrash, IconArrowLeft } from "@/components/Icons";
import Link from "next/link";

export default function PromptDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { update, remove } = usePrompts();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notes, setNotes] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [isAgent, setIsAgent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      router.replace("/login");
      return;
    }

    supabase
      .from("prompts")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          router.replace("/library");
          return;
        }
        setPrompt(data as Prompt);
        setTitle(data.title);
        setContent(data.content);
        setNotes(data.notes ?? "");
        setTagsRaw((data.tags ?? []).join(", "));
        setIsAgent(data.is_agent_config);
        setLoading(false);
      });
  }, [id, router]);

  const handleCopy = async () => {
    if (!prompt) return;
    await navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleSave = async () => {
    if (!prompt) return;
    setSaving(true);
    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const result = await update(prompt.id, {
      title: title.trim(),
      content: content.trim(),
      notes: notes.trim() || null,
      tags,
      is_agent_config: isAgent,
    });

    setSaving(false);
    if (result && !("error" in result)) {
      setPrompt(result);
      setEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt) return;
    if (!confirm("Delete this prompt? This cannot be undone.")) return;
    await remove(prompt.id);
    router.push("/library");
  };

  if (loading || !prompt) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/library"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="w-4 h-4" />
          Library
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy} className="gap-1.5">
            {copied ? (
              <>
                <IconCheck className="w-3.5 h-3.5 text-success" />
                Copied
              </>
            ) : (
              <>
                <IconCopy className="w-3.5 h-3.5" />
                Copy
              </>
            )}
          </Button>
          {!editing && (
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={handleDelete} aria-label="Delete">
            <IconTrash className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="space-y-5">
          <Input
            id="title"
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            id="content"
            label="Prompt / Agent config"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
          />
          <Input
            id="tags"
            label="Tags (comma-separated)"
            value={tagsRaw}
            onChange={(e) => setTagsRaw(e.target.value)}
          />
          <Textarea
            id="notes"
            label="Notes"
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
              className="rounded border-border"
            />
            This is an agent config
          </label>
          <div className="flex gap-3">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            <Button variant="ghost" onClick={() => setEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-1">
            {prompt.is_agent_config && (
              <span className="text-xs font-medium text-accent border border-accent/30 px-2 py-0.5 rounded-full">
                Agent config
              </span>
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{prompt.title}</h1>
          <p className="mt-1 text-xs text-muted">
            Updated {formatDate(prompt.updated_at)}
          </p>

          {prompt.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded bg-surface border border-border text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <pre className="mt-6 p-4 rounded-xl bg-surface border border-border text-sm font-mono whitespace-pre-wrap break-words leading-relaxed">
            {prompt.content}
          </pre>

          {prompt.notes && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-muted mb-2">Notes</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {prompt.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
