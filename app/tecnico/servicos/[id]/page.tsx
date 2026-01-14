"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function AntesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [os, setOs] = useState<any>(null);
  const [relatorio, setRelatorio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    try {
      const data = await apiFetch(`/projects/tecnico/view/${id}`);
      setOs(data);
    } catch (err: any) {
      alert("Erro ao carregar OS: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  function adicionarFoto() {
    const url = prompt("Cole a URL da foto:");
    if (url) {
      setFotos([...fotos, url]);
    }
  }

  function removerFoto(url: string) {
    setFotos(fotos.filter((f) => f !== url));
  }

  async function salvarAntes() {
    try {
      await apiFetch(`/projects/tecnico/antes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          relatorio,
          observacao,
          fotos
        })
      });

      router.push(`/tecnico/servicos/${id}/depois`);
    } catch (err: any) {
      alert("Erro ao salvar ANTES: " + err.message);
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

        <h1 className="text-2xl font-bold mb-4">ANTES – {os.osNumero}</h1>

        <div className="mb-4">
          <p><b>Cliente:</b> {os.cliente}</p>
          {os.marca && <p><b>Marca:</b> {os.marca}</p>}
          {os.unidade && <p><b>Unidade:</b> {os.unidade}</p>}
          {os.endereco && <p><b>Endereço:</b> {os.endereco}</p>}
          {os.detalhamento && (
            <div className="mt-2 p-3 bg-yellow-50 border rounded">
              <b>Detalhamento do serviço:</b>
              <p>{os.detalhamento}</p>
            </div>
          )}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Relatório</label>
          <textarea
            value={relatorio}
            onChange={(e) => setRelatorio(e.target.value)}
            className="border p-2 rounded w-full min-h-[80px]"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Observação</label>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="border p-2 rounded w-full min-h-[80px]"
          />
        </div>

        <div className="mb-4">
          <p className="font-medium mb-2">📷 Adicionar fotos</p>

          <button
            onClick={adicionarFoto}
            className="bg-blue-600 text-white px-4 py-2 rounded mb-3"
          >
            📷 Adicionar Foto
          </button>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fotos.map((foto) => (
              <div key={foto} className="relative">
                <img src={foto} className="rounded border" />
                <button
                  onClick={() => removerFoto(foto)}
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
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full transition"
        >
          Salvar e ir para DEPOIS →
        </button>

      </div>
    </div>
  );
}
