"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function AdminPage() {
  const router = useRouter();

  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔒 PROTEÇÃO TOTAL
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "admin") {
      router.replace("/login");
      return;
    }

    carregarServicos();
  }, []);

  async function carregarServicos() {
    setLoading(true);

    try {
      const data = await apiFetch("/projects/admin/all");

      if (!Array.isArray(data)) {
        throw new Error("Resposta inválida do servidor");
      }

      const ordenado = [...data].sort((a, b) => {
        const osA = a.osNumero || "";
        const osB = b.osNumero || "";
        return osB.localeCompare(osA);
      });

      setServicos(ordenado);
    } catch (err) {
      console.error("ADMIN LOAD ERROR:", err);
      alert("Sessão expirada. Faça login novamente.");
      localStorage.clear();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  async function cancelarServico(id: string) {
    if (!confirm("Deseja cancelar esta OS?")) return;

    try {
      await apiFetch(`/projects/admin/cancelar/${id}`, {
        method: "PUT",
      });
      carregarServicos();
    } catch (err: any) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {servicos.length === 0 && <p>Nenhuma OS encontrada.</p>}

      {servicos.map((s) => (
        <div key={s._id} className="bg-white p-4 rounded shadow">
          <b>{s.osNumero}</b>
          <p>Cliente: {s.cliente}</p>
          <p>Status: {s.status}</p>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => router.push(`/admin/servicos/${s._id}`)}
              className="btn-blue"
            >
              Ver
            </button>

            <button
              onClick={() => cancelarServico(s._id)}
              className="btn-red"
            >
              Cancelar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
