import type { Prompt } from "@/types";

export function promptsToJSON(prompts: Prompt[]): string {
  return JSON.stringify(prompts, null, 2);
}

export function promptsToMarkdown(prompts: Prompt[]): string {
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
