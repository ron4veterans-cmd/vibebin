export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Allow only same-app paths so `next` cannot redirect off-site. */
export function safeNextPath(
  value: string | null | undefined,
  fallback = "/library"
): string {
  if (!value) return fallback;
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("://")
  ) {
    return fallback;
  }
  return value;
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

