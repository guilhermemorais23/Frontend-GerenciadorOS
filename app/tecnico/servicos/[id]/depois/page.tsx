"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "https://gerenciador-de-os.onrender.com";

export default function DepoisPage() {
  const { id } = useParams();
  const router = useRouter();

  const [os, setOs] = useState<any>(null);
  const [relatorio, setRelatorio] = useState("");
  const [observacao, setObservacao] = useState("");
  const [fotos, setFotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/projects/tecnico/view/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    // 🚫 NUNCA ENTRA NO DEPOIS SE NÃO CONCLUIU
    if (data.status !== "concluido") {
      router.replace(`/tecnico/servicos/${id}/antes`);
      return;
    }

    setOs(data);
    setLoading(false);
  }

  async function salvarDepois() {
    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("relatorio", relatorio);
    form.append("observacao", observacao);
    fotos.forEach(f => form.append("fotos", f));

    await fetch(`${API_URL}/projects/tecnico/depois/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    router.push("/tecnico");
  }

  if (loading) return <p>Carregando...</p>;
  if (!os) return <p>OS não encontrada</p>;

  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold mb-4">DEPOIS – {os.osNumero}</h1>

      <label>Relatório final</label>
      <textarea className="border w-full mb-3" value={relatorio} onChange={e => setRelatorio(e.target.value)} />

      <label>Observações finais</label>
      <textarea className="border w-full mb-3" value={observacao} onChange={e => setObservacao(e.target.value)} />

      <label>📷 Fotos</label>
      <input type="file" accept="image/*" multiple onChange={e => setFotos(Array.from(e.target.files || []))} />

      <button className="mt-4 bg-green-600 text-white p-3 w-full" onClick={salvarDepois}>
        Finalizar OS
      </button>
    </div>
  );
}
