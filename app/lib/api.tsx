const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit = {}) {
  if (!API_URL) {
    throw new Error("API_URL não configurada");
  }

  const token = localStorage.getItem("token");

  const headers: any = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(API_URL + path, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro na API");
  }

  return res.json();
}
