"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AntesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [os, setOs] = useState<any>(null);
  const [relatorio, setRelatorio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `https://gerenciador-de-os.onrender.com/projects/tecnico/view/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao buscar OS");
      }

      const data = await res.json();

      // 🔒 REGRA 1 — OS CONCLUÍDA → VISUALIZAÇÃO
      if (data.status === "concluido") {
        router.replace(`/tecnico/servicos/${id}/visualizar`);
        return;
      }

      // 🔁 REGRA 2 — ANTES JÁ FEITO → PULAR PARA DEPOIS
      if (data.antes && data.antes.fotos && data.antes.fotos.length > 0) {
        router.replace(`/tecnico/servicos/${id}/depois`);
        return;
      }

      setOs(data);
    } catch (err) {
      alert("Erro ao carregar OS");
    } finally {
      setLoading(false);
    }
  }

  function handleFotosChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;
    setFotos(Array.from(e.target.files));
  }

  function removerFoto(index: number) {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  }

  async function salvarAntes() {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("relatorio", relatorio);
      formData.append("observacao", observacao);

      fotos.forEach((foto) => {
        formData.append("fotos", foto);
      });

      const res = await fetch(
        `https://gerenciador-de-os.onrender.com/projects/tecnico/antes/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error("Erro ao salvar ANTES");
      }

      router.push(`/tecnico/servicos/${id}/depois`);
    } catch (err) {
      alert("Erro ao salvar ANTES");
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  if (!os) {
    return <div className="p-6">OS não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-2">
          ANTES – {os.osNumero}
        </h1>

        {/* DATAS */}
        <p className="text-sm text-gray-600 mb-4">
          Criado em: {new Date(os.createdAt).toLocaleDateString("pt-BR")} •
          Última atualização: {new Date(os.updatedAt).toLocaleDateString("pt-BR")}
        </p>

        {/* INFO */}
        <div className="mb-4 space-y-1">
          <p><b>Cliente:</b> {os.cliente}</p>
          {os.marca && <p><b>Marca:</b> {os.marca}</p>}
          {os.unidade && <p><b>Unidade:</b> {os.unidade}</p>}
          {os.endereco && <p><b>Endereço:</b> {os.endereco}</p>}
        </div>

        {os.detalhamento && (
          <div className="mb-4 p-3 bg-yellow-50 border rounded">
            <b>Detalhamento:</b>
            <p>{os.detalhamento}</p>
          </div>
        )}

        {/* RELATÓRIO */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Relatório (Antes)</label>
          <textarea
            value={relatorio}
            onChange={(e) => setRelatorio(e.target.value)}
            className="border p-2 rounded w-full min-h-[80px]"
          />
        </div>

        {/* OBSERVAÇÃO */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Observação</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="border p-2 rounded w-full min-h-[80px]"
          />
        </div>

        {/* FOTOS */}
        <div className="mb-4">
          <label className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded cursor-pointer">
            📷 Adicionar fotos
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              hidden
              onChange={handleFotosChange}
            />
          </label>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {fotos.map((foto, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(foto)}
                  className="rounded border"
                />
                <button
                  onClick={() => removerFoto(index)}
                  className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 rounded"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={salvarAntes}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
        >
          Salvar e ir para DEPOIS →
        </button>
      </div>
    </div>
  );
}
