const API_URL = "https://gerenciador-de-os.onrender.com";


export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(API_URL + path, {
    ...options,
    cache: "no-store", // <<<<<<<< MUITO IMPORTANTE
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Erro na requisição");
  }

  return res.json();
}
