"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Prompt } from "@/types";
import { FREE_PROMPT_LIMIT } from "@/types";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single();

    setIsPro(profile?.subscription_status === "active");

    const { data } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setPrompts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
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
    if (limitReached) {
      return { error: "FREE_LIMIT_REACHED" };
    }

    const supabase = createClient();
    if (!supabase) return { error: "Not available" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in" };

    const { error } = await supabase.from("prompts").insert({
      user_id: user.id,
      title: input.title,
      content: input.content,
      notes: input.notes || null,
      tags: input.tags || [],
      is_agent_config: input.is_agent_config || false,
    });

    if (!error) await load();
    return error ? { error: error.message } : { success: true };
  };

const update = async (id: string, updates: Partial<Prompt>) => {
  const supabase = createClient();
  if (!supabase) return { error: "Not available" };

  const { data, error } = await supabase
    .from("prompts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  await load();
  return data;
};

  const remove = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("prompts").delete().eq("id", id);
    await load();
  };

  return {
    prompts,
    loading,
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
