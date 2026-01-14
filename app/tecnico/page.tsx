"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function TecnicoPage() {
  const router = useRouter();
  const [servicos, setServicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "tecnico") {
      router.push("/login");
      return;
    }

    carregarServicos();
  }, []);

  async function carregarServicos() {
    try {
      const data = await apiFetch("/projects/tecnico/my");
      setServicos(data);
    } catch (err: any) {
      alert("Erro ao carregar serviços: " + err.message);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <h1 className="text-2xl font-bold mb-6">Minhas Ordens de Serviço</h1>

      {servicos.length === 0 && (
        <p className="text-gray-600">Nenhuma OS atribuída.</p>
      )}

      <div className="grid gap-4">
        {servicos.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-xl shadow p-4 flex flex-col gap-2"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold">{s.osNumero}</span>
              <span className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                {s.status}
              </span>
            </div>

            <div><b>Cliente:</b> {s.cliente}</div>
            {s.marca && <div><b>Marca:</b> {s.marca}</div>}
            {s.unidade && <div><b>Unidade:</b> {s.unidade}</div>}
            {s.endereco && <div><b>Endereço:</b> {s.endereco}</div>}
            {s.detalhamento && <div><b>Detalhamento:</b> {s.detalhamento}</div>}

            <button
              onClick={() => router.push(`/tecnico/servicos/${s._id}/antes`)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded mt-2"
            >
              Abrir Serviço
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
