/** Aceita URL https, data URL ou base64 cru (legado). */
export function normalizeImageSrc(value?: string): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (raw.startsWith("data:image")) {
    // Corrige data URI malformado sem vírgula após ";base64"
    const normalizedDataUri = raw.replace(/;base64(?!,)/i, ";base64,").replace(/\s+/g, "");
    return normalizedDataUri;
  }
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^file:\/\//i.test(raw)) return raw;
  return `data:image/jpeg;base64,${raw.replace(/\s+/g, "")}`;
}
