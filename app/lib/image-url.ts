/** Aceita URL https, data URL ou base64 cru (legado). */
export function normalizeImageSrc(value?: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image")) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^file:\/\//i.test(raw)) return raw;
  return `data:image/jpeg;base64,${raw.replace(/\s+/g, "")}`;
}
