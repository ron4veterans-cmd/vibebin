"use client";

import { useState, useEffect, useCallback } from "react";
import type { Prompt } from "@/types";
import { FREE_PROMPT_LIMIT } from "@/types";
import { createClient } from "@/lib/supabase/client";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Ensure profile exists (trigger may not have run yet)
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        subscription_status: "free",
      });
    }

    setIsPro(profile?.subscription_status === "active");

    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (!error && data) {
      setPrompts(data as Prompt[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback(
    async (data: {
      title: string;
      content: string;
      notes?: string | null;
      tags?: string[];
      is_agent_config?: boolean;
    }) => {
      const supabase = createClient();
      if (!supabase) return { error: "Supabase not configured" };

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { error: "Not authenticated" };

      // Ensure profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, subscription_status")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          subscription_status: "free",
        });
        if (profileError) {
          return { error: `Profile error: ${profileError.message}` };
        }
      }

      const pro = profile?.subscription_status === "active";
      const { count } = await supabase
        .from("prompts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (!pro && (count ?? 0) >= FREE_PROMPT_LIMIT) {
        return { error: "FREE_LIMIT_REACHED" };
      }

      const { data: created, error } = await supabase
        .from("prompts")
        .insert({
          user_id: user.id,
          title: data.title,
          content: data.content,
          notes: data.notes ?? null,
          tags: data.tags ?? [],
          is_agent_config: data.is_agent_config ?? false,
        })
        .select()
        .single();

      if (error) return { error: error.message };
      await refresh();
      return created as Prompt;
    },
    [refresh]
  );

  const update = useCallback(
    async (
      id: string,
      data: Partial<{
        title: string;
        content: string;
        notes: string | null;
        tags: string[];
        is_agent_config: boolean;
      }>
    ) => {
      const supabase = createClient();
      if (!supabase) return { error: "Not authenticated" };

      const { data: updated, error } = await supabase
        .from("prompts")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) return { error: error.message };
      await refresh();
      return updated as Prompt;
    },
    [refresh]
  );

  const remove = useCallback(
    async (id: string) => {
      const supabase = createClient();
      if (!supabase) return false;

      const { error } = await supabase.from("prompts").delete().eq("id", id);
      if (!error) await refresh();
      return !error;
    },
    [refresh]
  );

  const count = prompts.length;
  const limitReached = !isPro && count >= FREE_PROMPT_LIMIT;

  return {
    prompts,
    loading,
    count,
    isPro,
    limitReached,
    canCreate: !limitReached,
    freeLimit: FREE_PROMPT_LIMIT,
    add,
    update,
    remove,
    refresh,
  };
}
