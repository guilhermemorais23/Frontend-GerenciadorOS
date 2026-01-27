const API_URL = "https://gerenciador-de-os.onrender.com";

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = localStorage.getItem("token");

  const headers: Record<string, any> = {
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

  // 🚨 TRATAMENTO OBRIGATÓRIO
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      // sessão inválida → força login
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("nome");
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const errorText = await res.text();
    throw new Error(errorText || "Erro na requisição");
  }

  // tenta parsear JSON
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    console.error("❌ Backend não retornou JSON:", text);
    throw new Error("Resposta inválida do servidor");
  }
}
