import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserProfile } from "@/types";

export async function ensureProfile(
  supabase: SupabaseClient,
  user: { id: string; email: string | null }
): Promise<{ profile: UserProfile | null; error: string | null }> {
  const existing = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.error) {
    return { profile: null, error: existing.error.message };
  }
  if (existing.data) {
    return { profile: existing.data as UserProfile, error: null };
  }

  const inserted = await supabase
    .from("profiles")
    .insert({ id: user.id, email: user.email })
    .select("*")
    .single();

  if (!inserted.error && inserted.data) {
    return { profile: inserted.data as UserProfile, error: null };
  }

  const again = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (again.data) {
    return { profile: again.data as UserProfile, error: null };
  }

  return {
    profile: null,
    error:
      inserted.error?.message ??
      again.error?.message ??
      "Could not create profile",
  };
}
