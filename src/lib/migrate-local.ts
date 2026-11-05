import type { SupabaseClient } from "@supabase/supabase-js";

const PROMPTS_KEY = "vibebin_prompts";
const COLLECTIONS_KEY = "vibebin_collections";
const LINKS_KEY = "vibebin_collection_prompts";
const CLAIM_KEY = "vibebin_local_claim_user";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type MigrateResult = {
  importedPrompts: number;
  importedCollections: number;
  limited: boolean;
  collectionsWaiting: boolean;
};

const EMPTY: MigrateResult = {
  importedPrompts: 0,
  importedCollections: 0,
  limited: false,
  collectionsWaiting: false,
};

type LocalPrompt = {
  id: string;
  title: string;
  content: string;
  notes: string | null;
  tags: string[];
  is_agent_config: boolean;
  created_at?: string;
  updated_at?: string;
};

type LocalCollection = {
  id: string;
  name: string;
  description: string | null;
  created_at?: string;
};

type WriteError = { message?: string; code?: string };

let pending: Promise<MigrateResult> | null = null;

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function readIdSet(key: string): Set<string> {
  const parsed = readJson(key);
  if (!Array.isArray(parsed)) return new Set();
  return new Set(parsed.filter((id): id is string => typeof id === "string"));
}

function writeIdSet(key: string, ids: Set<string>): void {
  localStorage.setItem(key, JSON.stringify([...ids]));
}

function isDuplicate(error: WriteError): boolean {
  return (
    error.code === "23505" ||
    (error.message ?? "").toLowerCase().includes("duplicate")
  );
}

function isLimit(error: WriteError): boolean {
  return error.code === "P0001" || (error.message ?? "").includes("FREE_LIMIT_REACHED");
}

function timestamp(value: string | undefined): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return value;
}

function parsePrompt(value: unknown): LocalPrompt | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !UUID_RE.test(row.id)) return null;
  if (typeof row.title !== "string" || !row.title.trim()) return null;
  if (typeof row.content !== "string") return null;
  const tags = Array.isArray(row.tags)
    ? row.tags.filter((tag): tag is string => typeof tag === "string")
    : [];
  return {
    id: row.id,
    title: row.title.trim(),
    content: row.content,
    notes: typeof row.notes === "string" ? row.notes : null,
    tags,
    is_agent_config: row.is_agent_config === true,
    created_at: timestamp(typeof row.created_at === "string" ? row.created_at : undefined),
    updated_at: timestamp(typeof row.updated_at === "string" ? row.updated_at : undefined),
  };
}

function parseCollection(value: unknown): LocalCollection | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !UUID_RE.test(row.id)) return null;
  if (typeof row.name !== "string" || !row.name.trim()) return null;
  return {
    id: row.id,
    name: row.name.trim(),
    description: typeof row.description === "string" ? row.description : null,
    created_at: timestamp(typeof row.created_at === "string" ? row.created_at : undefined),
  };
}

async function run(
  supabase: SupabaseClient,
  userId: string,
  isPro: boolean
): Promise<MigrateResult> {
  if (typeof window === "undefined") return EMPTY;

  const prompts = (Array.isArray(readJson(PROMPTS_KEY)) ? (readJson(PROMPTS_KEY) as unknown[]) : [])
    .map(parsePrompt)
    .filter((prompt): prompt is LocalPrompt => Boolean(prompt));
  const collections = (
    Array.isArray(readJson(COLLECTIONS_KEY)) ? (readJson(COLLECTIONS_KEY) as unknown[]) : []
  )
    .map(parseCollection)
    .filter((collection): collection is LocalCollection => Boolean(collection));

  if (prompts.length === 0 && collections.length === 0) return EMPTY;

  const claim = localStorage.getItem(CLAIM_KEY);
  if (claim && claim !== userId) return EMPTY;
  localStorage.setItem(CLAIM_KEY, userId);

  const importedPrompts = readIdSet(`vibebin_imported_prompts_${userId}`);
  const importedCollections = readIdSet(`vibebin_imported_collections_${userId}`);
  const result: MigrateResult = { ...EMPTY };

  for (const prompt of prompts) {
    if (importedPrompts.has(prompt.id)) continue;
    const payload: Record<string, unknown> = {
      id: prompt.id,
      user_id: userId,
      title: prompt.title,
      content: prompt.content,
      notes: prompt.notes,
      tags: prompt.tags,
      is_agent_config: prompt.is_agent_config,
    };
    if (prompt.created_at) payload.created_at = prompt.created_at;
    if (prompt.updated_at) payload.updated_at = prompt.updated_at;

    const { error } = await supabase.from("prompts").insert(payload);
    if (error && isLimit(error)) {
      result.limited = true;
      break;
    }
    if (error && !isDuplicate(error)) {
      return result;
    }
    importedPrompts.add(prompt.id);
    writeIdSet(`vibebin_imported_prompts_${userId}`, importedPrompts);
    if (!error) result.importedPrompts += 1;
  }

  const waiting = collections.some((collection) => !importedCollections.has(collection.id));
  if (!isPro) {
    result.collectionsWaiting = waiting;
    return result;
  }

  for (const collection of collections) {
    if (importedCollections.has(collection.id)) continue;
    const payload: Record<string, unknown> = {
      id: collection.id,
      user_id: userId,
      name: collection.name,
      description: collection.description,
    };
    if (collection.created_at) payload.created_at = collection.created_at;
    const { error } = await supabase.from("collections").insert(payload);
    if (error && !isDuplicate(error)) {
      if ((error.message ?? "").includes("PRO_REQUIRED")) {
        result.collectionsWaiting = true;
      }
      return result;
    }
    importedCollections.add(collection.id);
    writeIdSet(`vibebin_imported_collections_${userId}`, importedCollections);
    if (!error) result.importedCollections += 1;
  }

  const links = readJson(LINKS_KEY);
  if (links && typeof links === "object" && !Array.isArray(links)) {
    for (const [collectionId, promptIds] of Object.entries(links as Record<string, unknown>)) {
      if (!importedCollections.has(collectionId) || !Array.isArray(promptIds)) continue;
      for (const promptId of promptIds) {
        if (typeof promptId !== "string" || !importedPrompts.has(promptId)) continue;
        const { error } = await supabase.from("collection_prompts").insert({
          collection_id: collectionId,
          prompt_id: promptId,
        });
        if (error && !isDuplicate(error)) return result;
      }
    }
  }

  return result;
}

export function migrateLocalData(
  supabase: SupabaseClient,
  userId: string,
  isPro: boolean
): Promise<MigrateResult> {
  if (!pending) {
    pending = run(supabase, userId, isPro).finally(() => {
      pending = null;
    });
    return pending;
  }
  return pending.then(() => run(supabase, userId, isPro));
}
