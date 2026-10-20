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
    if (!user) return;

    // Check Pro status
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

  const create = async (title: string, content: string) => {
    if (!isPro && prompts.length >= FREE_PROMPT_LIMIT) {
      return { error: "Free limit reached. Upgrade to Pro for unlimited prompts." };
    }

    const supabase = createClient();
    if (!supabase) return { error: "Not available" };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not signed in" };

    const { error } = await supabase.from("prompts").insert({
      user_id: user.id,
      title,
      content,
    });

    if (!error) await load();
    return { error: error?.message };
  };

  const update = async (id: string, updates: Partial<Prompt>) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("prompts").update(updates).eq("id", id);
    await load();
  };

  const remove = async (id: string) => {
    const supabase = createClient();
    if (!supabase) return;
    await supabase.from("prompts").delete().eq("id", id);
    await load();
  };

  return { prompts, loading, isPro, create, update, remove, reload: load };
}
