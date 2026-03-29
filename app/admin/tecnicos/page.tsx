"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

type Tecnico = {
  _id: string;
  nome?: string;
  email?: string;
  telefone?: string;
};

export default function TecnicosPage() {
  const router = useRouter();
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarTecnicos();
  }, []);

  async function carregarTecnicos() {
    try {
      const data = await apiFetch("/auth/tecnicos");
      setTecnicos(Array.isArray(data) ? (data as Tecnico[]) : []);
    } catch (err: unknown) {
      alert("Erro ao carregar tecnicos: " + (err instanceof Error ? err.message : "erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function excluirTecnico(id: string) {
    const ok = confirm("Tem certeza que deseja excluir este tecnico?");
    if (!ok) return;

    try {
      await apiFetch(`/auth/tecnicos/${id}`, {
        method: "DELETE",
      });

      alert("Tecnico excluido com sucesso");
      carregarTecnicos();
    } catch (err: unknown) {
      alert("Erro ao excluir tecnico: " + (err instanceof Error ? err.message : "erro desconhecido"));
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-black">Tecnicos</h1>
          <button
            onClick={() => router.push("/admin")}
            className="rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
          >
            Voltar
          </button>
        </div>

        <button
          onClick={() => router.push("/admin/tecnicos/novo")}
          className="mb-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        >
          + Novo Tecnico
        </button>

        <div className="space-y-3">
          {tecnicos.map((t) => (
            <div key={t._id} className="flex items-center justify-between rounded border p-3">
              <div>
                <p className="font-semibold text-black">{t.nome || "-"}</p>
                <p className="text-sm text-gray-600">{t.email || "-"}</p>
                <p className="text-sm text-gray-600">Telefone: {t.telefone || "Sem telefone"}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/admin/tecnicos/${t._id}/editar`)}
                  className="rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                >
                  Editar
                </button>

                <button
                  onClick={() => excluirTecnico(t._id)}
                  className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
