/**
 * Chaves de sessionStorage do painel do técnico devem ser por usuário,
 * senão um técnico vê cache/lista do outro no mesmo navegador.
 */
export function getTecnicoScopeKey(): string {
  if (typeof window === "undefined") return "anon";
  const uid = localStorage.getItem("userId")?.trim();
  if (uid) return uid;
  const token = localStorage.getItem("token")?.trim();
  if (token && token.length >= 24) return `t:${token.slice(0, 12)}:${token.slice(-12)}`;
  return "anon";
}

export function tecnicoDashboardCacheKey(): string {
  return `tecnico-dashboard-cache:${getTecnicoScopeKey()}`;
}

export function tecnicoDashboardFiltersKey(): string {
  return `tecnico-dashboard-filters:${getTecnicoScopeKey()}`;
}

/** Remove chaves antigas (sem sufixo de usuário) que vazavam dados entre logins. */
export function clearLegacyTecnicoSessionKeys(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem("tecnico-dashboard-cache");
  sessionStorage.removeItem("tecnico-dashboard-filters");
}

/** Limpa todos os caches de lista/filtro do técnico (ex.: sessão expirada). */
export function clearAllTecnicoDashboardSessionKeys(): void {
  if (typeof window === "undefined") return;
  Object.keys(sessionStorage).forEach((k) => {
    if (k.startsWith("tecnico-dashboard-cache:") || k.startsWith("tecnico-dashboard-filters:")) {
      sessionStorage.removeItem(k);
    }
  });
  clearLegacyTecnicoSessionKeys();
}
