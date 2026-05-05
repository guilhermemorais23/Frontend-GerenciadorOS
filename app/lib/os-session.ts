function getScopeKey(): string {
  if (typeof window === "undefined") return "anon";
  const uid = localStorage.getItem("userId")?.trim();
  if (uid) return uid;
  const token = localStorage.getItem("token")?.trim();
  if (token && token.length >= 24) return `t:${token.slice(0, 12)}:${token.slice(-12)}`;
  return "anon";
}

export function adminServicosCacheKey(): string {
  return `os-admin-list-cache:${getScopeKey()}`;
}

export function osDetailCacheKey(role: "admin" | "tecnico", id: string): string {
  return `os-detail-cache:${role}:${getScopeKey()}:${id}`;
}

export function readSessionJson<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeSessionJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Cache is optional; storage can be full or unavailable.
  }
}

export function clearOsSessionKeys(): void {
  if (typeof window === "undefined") return;
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("os-admin-list-cache:") || key.startsWith("os-detail-cache:")) {
      sessionStorage.removeItem(key);
    }
  });
}
