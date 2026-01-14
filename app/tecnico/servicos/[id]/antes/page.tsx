"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AntesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [relatorio, setRelatorio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  async function salvarAntes() {
    setLoading(true);
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("relatorio", relatorio);
    formData.append("observacao", observacao);
    fotos.forEach((f) => formData.append("fotos", f));

    const res = await fetch(`http://localhost:3001/projects/tecnico/antes/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) {
      alert("Erro ao salvar ANTES");
      setLoading(false);
      return;
    }

    router.push(`/tecnico/servicos/${id}/depois`);
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-black">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-xl font-bold mb-4">ANTES</h1>

        <textarea
          value={relatorio}
          onChange={(e) => setRelatorio(e.target.value)}
          placeholder="Relatório"
          className="w-full border p-2 rounded mb-3"
        />

        <textarea
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observações"
          className="w-full border p-2 rounded mb-3"
        />

        <label className="flex items-center gap-2 cursor-pointer mb-4">
          📷 <span>Adicionar fotos</span>
          <input type="file" multiple hidden onChange={(e) => setFotos(Array.from(e.target.files || []))} />
        </label>

        <button
          onClick={salvarAntes}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          {loading ? "Salvando..." : "Salvar e continuar"}
        </button>
      </div>
    </div>
  );
}
