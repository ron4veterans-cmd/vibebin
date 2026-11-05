"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { mapDbError } from "@/lib/db-error";
import type { Prompt } from "@/types";
import { FREE_PROMPT_LIMIT } from "@/types";

export function usePrompts() {
  const { ready, supabase, user, isPro } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ready) return;
    if (!supabase || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError(queryError.message);
      setPrompts([]);
    } else {
      setError(null);
      setPrompts((data ?? []) as Prompt[]);
    }
    setLoading(false);
  }, [ready, supabase, user]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const count = prompts.length;
  const freeLimit = FREE_PROMPT_LIMIT;
  const limitReached = !isPro && count >= freeLimit;
  const canCreate = !limitReached;

  const add = async (input: {
    title: string;
    content: string;
    notes?: string | null;
    tags?: string[];
    is_agent_config?: boolean;
  }) => {
    if (limitReached) return { error: "FREE_LIMIT_REACHED" };
    if (!supabase || !user) return { error: "Not available" };

    const { error: insertError } = await supabase.from("prompts").insert({
      user_id: user.id,
      title: input.title,
      content: input.content,
      notes: input.notes || null,
      tags: input.tags || [],
      is_agent_config: input.is_agent_config || false,
    });

    if (insertError) {
      return { error: mapDbError(insertError.message, insertError.code) };
    }
    await load();
    return { success: true as const };
  };

  const update = async (id: string, updates: Partial<Prompt>) => {
    if (!supabase) return { error: "Not available" };

    const payload: Partial<Prompt> = {};
    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.content !== undefined) payload.content = updates.content;
    if (updates.notes !== undefined) payload.notes = updates.notes;
    if (updates.tags !== undefined) payload.tags = updates.tags;
    if (updates.is_agent_config !== undefined) {
      payload.is_agent_config = updates.is_agent_config;
    }

    const { data, error: updateError } = await supabase
      .from("prompts")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (updateError) return { error: mapDbError(updateError.message, updateError.code) };
    await load();
    return data as Prompt;
  };

  const remove = async (id: string) => {
    if (!supabase) return;
    await supabase.from("prompts").delete().eq("id", id);
    await load();
  };

  return {
    prompts,
    loading,
    error,
    count,
    isPro,
    freeLimit,
    limitReached,
    canCreate,
    add,
    create: add,
    update,
    remove,
    reload: load,
  };
}
