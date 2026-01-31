"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://gerenciador-de-os.onrender.com";

export default function AntesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [os, setOs] = useState<any>(null);
  const [relatorio, setRelatorio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarOS();
  }, []);

  async function carregarOS() {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/projects/tecnico/view/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error("Erro ao carregar OS");
      }

      // 🔒 REGRA FINAL
      if (data.status === "concluido") {
        router.replace(`/tecnico/servicos/${id}/depois`);
        return;
      }

      setOs(data);
    } catch (err: any) {
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
    setSalvando(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("relatorio", relatorio);
      formData.append("observacao", observacao);

      fotos.forEach((foto) => {
        formData.append("fotos", foto);
      });

      const res = await fetch(`${API_URL}/projects/tecnico/antes/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar ANTES");
      }

      // 👉 só aqui vai para depois
      router.push(`/tecnico/servicos/${id}/depois`);
    } catch {
      alert("Erro ao salvar ANTES");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>;
  if (!os) return <div className="p-6">OS não encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">
          ANTES – {os.osNumero}
        </h1>

        <textarea
          className="border p-2 rounded w-full mb-3"
          placeholder="Relatório"
          value={relatorio}
          onChange={(e) => setRelatorio(e.target.value)}
        />

        <textarea
          className="border p-2 rounded w-full mb-3"
          placeholder="Observação"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFotosChange}
        />

        <div className="grid grid-cols-2 gap-2 mt-3">
          {fotos.map((f, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(f)}
                className="h-32 w-full object-cover rounded"
              />
              <button
                onClick={() => removerFoto(i)}
                className="absolute top-1 right-1 bg-red-600 text-white px-2 rounded"
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={salvarAntes}
          disabled={salvando}
          className="mt-4 bg-green-600 text-white w-full py-3 rounded"
        >
          {salvando ? "Salvando..." : "Salvar e ir para DEPOIS"}
        </button>
      </div>
    </div>
  );
}
