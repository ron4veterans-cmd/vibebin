"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getLocalUser,
  getCollections,
  createCollection,
  deleteCollection,
  getPromptsInCollection,
  type LocalUser,
} from "@/lib/store";
import type { Collection } from "@/types";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { IconPlus, IconTrash } from "@/components/Icons";

export default function CollectionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<LocalUser | null>(null);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const refresh = () => setCollections(getCollections());

  useEffect(() => {
    const u = getLocalUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    refresh();
  }, [router]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    const result = createCollection(name);
    if ("error" in result) {
      if (result.error === "PRO_REQUIRED") {
        setError("Collections are a Pro feature. Upgrade to create them.");
      } else {
        setError(result.error);
      }
      return;
    }
    setName("");
    setCreating(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this collection? Prompts stay in your library.")) return;
    deleteCollection(id);
    refresh();
  };

  if (!user) {
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
        {user.isPro && (
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => setCreating(true)}
          >
            <IconPlus className="w-3.5 h-3.5" />
            New
          </Button>
        )}
      </div>

      {!user.isPro && (
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

      {creating && user.isPro && (
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
            <Button type="submit" size="sm">
              Create
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

      {collections.length === 0 && user.isPro && !creating && (
        <div className="border border-dashed border-border rounded-xl p-10 text-center">
          <p className="text-sm text-muted">No collections yet.</p>
          <Button
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => setCreating(true)}
          >
            <IconPlus className="w-3.5 h-3.5" />
            Create your first collection
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {collections.map((c) => {
          const prompts = getPromptsInCollection(c.id);
          return (
            <div
              key={c.id}
              className="border border-border rounded-xl bg-surface p-4 flex items-start justify-between gap-4"
            >
              <div>
                <h3 className="font-medium text-sm">{c.name}</h3>
                {c.description && (
                  <p className="mt-0.5 text-xs text-muted">{c.description}</p>
                )}
                <p className="mt-1 text-xs text-muted">
                  {prompts.length} prompt{prompts.length !== 1 ? "s" : ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(c.id)}
                aria-label="Delete collection"
              >
                <IconTrash className="w-4 h-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
