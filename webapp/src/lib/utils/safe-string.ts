export function safeString(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}
