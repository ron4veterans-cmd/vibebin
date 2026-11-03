export function mapDbError(message: string | undefined, code?: string): string {
  if (code === "P0001" || message?.includes("FREE_LIMIT_REACHED")) {
    return "FREE_LIMIT_REACHED";
  }
  if (message?.includes("PRO_REQUIRED")) {
    return "PRO_REQUIRED";
  }
  return message || "Something went wrong";
}
