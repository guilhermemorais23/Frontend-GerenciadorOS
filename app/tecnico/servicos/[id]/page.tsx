"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gerenciador-de-os.onrender.com";

export default function ServicoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [os, setOs] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/projects/tecnico/view/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setOs(data);

      // 🔁 REGRA 2: VOLTA DE ONDE PAROU
      if (data.status === "aguardando_tecnico") {
        localStorage.setItem(`os-step-${id}`, "antes");
      }

      if (data.status === "em_andamento") {
        localStorage.setItem(`os-step-${id}`, "depois");
      }

      if (data.status === "concluido") {
        localStorage.removeItem(`os-step-${id}`);
      }
    } catch {
      setOs(null);
    } finally {
      setLoading(false);
    }
  }

  function irParaEtapa(etapa: "antes" | "depois") {
    localStorage.setItem(`os-step-${id}`, etapa);
    router.push(`/tecnico/servicos/${id}/${etapa}`);
  }

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!os) return <div className="p-6">OS não encontrada</div>;

  const podeIrDepois = os.status === "em_andamento";

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">
          OS {os.osNumero}
        </h1>

        <p className="mb-6">
          Status atual: <b>{os.status}</b>
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => irParaEtapa("antes")}
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded"
          >
            Ir para ANTES
          </button>

          <button
            onClick={() => irParaEtapa("depois")}
            disabled={!podeIrDepois}
            className={`py-3 rounded text-white ${
              podeIrDepois
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Ir para DEPOIS
          </button>

          {!podeIrDepois && (
            <p className="text-sm text-gray-500 text-center">
              ⚠️ Finalize o ANTES para liberar o DEPOIS
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
