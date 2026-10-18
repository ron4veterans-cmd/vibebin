import type { Prompt, Collection } from "@/types";
import { FREE_PROMPT_LIMIT } from "@/types";

const STORAGE_KEY = "vibebin_prompts";
const COLLECTIONS_KEY = "vibebin_collections";
const COLLECTION_PROMPTS_KEY = "vibebin_collection_prompts";
const USER_KEY = "vibebin_user";


export interface LocalUser {
  id: string;
  email: string;
  isPro: boolean;
}

function generateId(): string {
  return crypto.randomUUID();
}

export function getLocalUser(): LocalUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LocalUser;
  } catch {
    return null;
  }
}

export function setLocalUser(user: LocalUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearLocalUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function getPrompts(): Prompt[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Prompt[];
  } catch {
    return [];
  }
}

function savePrompts(prompts: Prompt[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

export function createPrompt(
  data: Omit<Prompt, "id" | "user_id" | "created_at" | "updated_at">
): Prompt | { error: string } {
  const user = getLocalUser();
  if (!user) return { error: "Not authenticated" };

  const existing = getPrompts();
  if (!user.isPro && existing.length >= FREE_PROMPT_LIMIT) {
    return { error: "FREE_LIMIT_REACHED" };
  }

  const now = new Date().toISOString();
  const prompt: Prompt = {
    id: generateId(),
    user_id: user.id,
    title: data.title,
    content: data.content,
    notes: data.notes ?? null,
    tags: data.tags ?? [],
    is_agent_config: data.is_agent_config ?? false,
    created_at: now,
    updated_at: now,
  };

  savePrompts([prompt, ...existing]);
  return prompt;
}

export function updatePrompt(
  id: string,
  data: Partial<Omit<Prompt, "id" | "user_id" | "created_at">>
): Prompt | { error: string } {
  const prompts = getPrompts();
  const index = prompts.findIndex((p) => p.id === id);
  if (index === -1) return { error: "Not found" };

  const updated: Prompt = {
    ...prompts[index],
    ...data,
    updated_at: new Date().toISOString(),
  };
  prompts[index] = updated;
  savePrompts(prompts);
  return updated;
}

export function deletePrompt(id: string): boolean {
  const prompts = getPrompts();
  const filtered = prompts.filter((p) => p.id !== id);
  if (filtered.length === prompts.length) return false;
  savePrompts(filtered);
  return true;
}

export function getPrompt(id: string): Prompt | null {
  return getPrompts().find((p) => p.id === id) ?? null;
}

export function getPromptCount(): number {
  return getPrompts().length;
}

export function canCreatePrompt(): boolean {
  const user = getLocalUser();
  if (!user) return false;
  if (user.isPro) return true;
  return getPromptCount() < FREE_PROMPT_LIMIT;
}

/* ─── Collections (Pro) ─── */

type CollectionPromptMap = Record<string, string[]>; // collectionId → promptIds

function getCollectionPromptMap(): CollectionPromptMap {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(COLLECTION_PROMPTS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as CollectionPromptMap;
  } catch {
    return {};
  }
}

function saveCollectionPromptMap(map: CollectionPromptMap): void {
  localStorage.setItem(COLLECTION_PROMPTS_KEY, JSON.stringify(map));
}

export function getCollections(): Collection[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(COLLECTIONS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Collection[];
  } catch {
    return [];
  }
}

function saveCollections(collections: Collection[]): void {
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
}

export function createCollection(
  name: string,
  description?: string | null
): Collection | { error: string } {
  const user = getLocalUser();
  if (!user) return { error: "Not authenticated" };
  if (!user.isPro) return { error: "PRO_REQUIRED" };

  const collection: Collection = {
    id: generateId(),
    user_id: user.id,
    name: name.trim(),
    description: description?.trim() || null,
    created_at: new Date().toISOString(),
  };

  saveCollections([collection, ...getCollections()]);
  return collection;
}

export function deleteCollection(id: string): boolean {
  const collections = getCollections().filter((c) => c.id !== id);
  saveCollections(collections);
  const map = getCollectionPromptMap();
  delete map[id];
  saveCollectionPromptMap(map);
  return true;
}

export function addPromptToCollection(
  collectionId: string,
  promptId: string
): void {
  const map = getCollectionPromptMap();
  const list = map[collectionId] ?? [];
  if (!list.includes(promptId)) {
    map[collectionId] = [...list, promptId];
    saveCollectionPromptMap(map);
  }
}

export function removePromptFromCollection(
  collectionId: string,
  promptId: string
): void {
  const map = getCollectionPromptMap();
  map[collectionId] = (map[collectionId] ?? []).filter((id) => id !== promptId);
  saveCollectionPromptMap(map);
}

export function getPromptsInCollection(collectionId: string): Prompt[] {
  const ids = getCollectionPromptMap()[collectionId] ?? [];
  const prompts = getPrompts();
  return ids
    .map((id) => prompts.find((p) => p.id === id))
    .filter((p): p is Prompt => Boolean(p));
}

/* ─── Export ─── */

export function exportPromptsJSON(): string {
  return JSON.stringify(getPrompts(), null, 2);
}

export function exportPromptsMarkdown(): string {
  const prompts = getPrompts();
  if (prompts.length === 0) return "# VibeBin Export\n\nNo prompts.\n";

  const parts = prompts.map((p) => {
    const tags = p.tags.length ? `\n**Tags:** ${p.tags.join(", ")}` : "";
    const notes = p.notes ? `\n\n> ${p.notes}` : "";
    const agent = p.is_agent_config ? " *(agent config)*" : "";
    return `## ${p.title}${agent}${tags}${notes}\n\n\`\`\`\n${p.content}\n\`\`\`\n`;
  });

  return `# VibeBin Export\n\nExported ${prompts.length} prompt${prompts.length === 1 ? "" : "s"} on ${new Date().toLocaleDateString()}\n\n---\n\n${parts.join("\n---\n\n")}`;
}

export function downloadFile(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

