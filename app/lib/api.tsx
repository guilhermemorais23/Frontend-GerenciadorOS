const API_URL = "https://gerenciador-de-os.onrender.com";

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  // Só define JSON se NÃO for FormData
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_URL + path, {
    ...options,
    headers,
  });

  // ❌ erro HTTP
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Erro na requisição");
  }

  // ✅ 204 No Content → não tenta parse
  if (res.status === 204) {
    return null;
  }

  const contentType = res.headers.get("content-type");

  // ✅ Só faz JSON.parse se for JSON
  if (contentType && contentType.includes("application/json")) {
    return await res.json();
  }

  // ✅ Resposta vazia ou texto simples
  return null;
}
