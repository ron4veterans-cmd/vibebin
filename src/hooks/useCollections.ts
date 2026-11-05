"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { mapDbError } from "@/lib/db-error";
import type { Collection } from "@/types";

export type CollectionWithCount = Collection & { prompt_count: number };

type CollectionQueryRow = Collection & {
  collection_prompts: { prompt_id: string }[] | null;
};

export function useCollections() {
  const { ready, supabase, user, isPro } = useAuth();
  const [collections, setCollections] = useState<CollectionWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!ready) return;
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("collections")
      .select("*, collection_prompts(prompt_id)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setCollections([]);
    } else {
      setError("");
      const rows = (data ?? []) as CollectionQueryRow[];
      setCollections(
        rows.map((row) => ({
          id: row.id,
          user_id: row.user_id,
          name: row.name,
          description: row.description,
          created_at: row.created_at,
          prompt_count: row.collection_prompts?.length ?? 0,
        }))
      );
    }
    setLoading(false);
  }, [ready, supabase, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const create = async (name: string, description?: string | null) => {
    if (!isPro) return { error: "PRO_REQUIRED" };
    if (!supabase || !user) return { error: "Not available" };

    const { error: insertError } = await supabase.from("collections").insert({
      user_id: user.id,
      name: name.trim(),
      description: description?.trim() || null,
    });

    if (insertError) {
      return { error: mapDbError(insertError.message, insertError.code) };
    }
    await load();
    return { success: true as const };
  };

  const remove = async (id: string) => {
    if (!supabase) return { error: "Not available" };
    const { error: deleteError } = await supabase.from("collections").delete().eq("id", id);
    if (deleteError) return { error: deleteError.message };
    await load();
    return { success: true as const };
  };

  return { collections, loading, error, isPro, create, remove, reload: load };
}
