"use client";

import { useState } from "react";
import Link from "next/link";
import { useCollections } from "@/hooks/useCollections";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { IconPlus, IconTrash } from "@/components/Icons";

export default function CollectionsPage() {
  const { collections, loading, error: loadError, isPro, create, remove } = useCollections();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    const result = await create(name);
    setSaving(false);
    if ("error" in result && result.error) {
      setError(
        result.error === "PRO_REQUIRED"
          ? "Collections are a Pro feature. Upgrade to create them."
          : result.error
      );
      return;
    }
    setName("");
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this collection? Prompts stay in your library.")) return;
    await remove(id);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-muted text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="mt-1 text-sm text-muted">
            Group prompts into folders. Pro feature.
          </p>
        </div>
        {isPro && (
          <Button size="sm" className="gap-1.5" onClick={() => setCreating(true)}>
            <IconPlus className="w-3.5 h-3.5" />
            New
          </Button>
        )}
      </div>

      {loadError && <p className="mb-4 text-sm text-destructive">{loadError}</p>}

      {!isPro && (
        <div className="border border-border rounded-xl bg-surface p-6 text-center mb-8">
          <p className="text-sm text-muted">
            Collections are available on Pro. Organize unlimited prompts into
            folders.
          </p>
          <Link href="/upgrade" className="inline-block mt-4">
            <Button size="sm">Upgrade to Pro</Button>
          </Link>
        </div>
      )}

      {creating && isPro && (
        <form
          onSubmit={handleCreate}
          className="border border-border rounded-xl bg-surface p-4 mb-6 space-y-3"
        >
          <Input
            id="collection-name"
            label="Collection name"
            placeholder="e.g. Coding agents"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? "Creating…" : "Create"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreating(false);
                setError("");
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {collections.length === 0 && isPro && !creating && (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm text-muted">No collections yet.</p>
          <Button size="sm" className="mt-4 gap-1.5" onClick={() => setCreating(true)}>
            <IconPlus className="w-3.5 h-3.5" />
            Create your first collection
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {collections.map((collection) => (
          <div
            key={collection.id}
            className="border border-border rounded-xl bg-surface p-4 flex items-start justify-between gap-4"
          >
            <div>
              <h3 className="font-medium text-sm">{collection.name}</h3>
              {collection.description && (
                <p className="mt-0.5 text-xs text-muted">{collection.description}</p>
              )}
              <p className="mt-1 text-xs text-muted">
                {collection.prompt_count} prompt{collection.prompt_count !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(collection.id)}
              aria-label="Delete collection"
            >
              <IconTrash className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
