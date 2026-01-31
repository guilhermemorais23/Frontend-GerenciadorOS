"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "https://gerenciador-de-os.onrender.com";

export default function AntesPage() {
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

    // 🔒 SÓ VAI PRO DEPOIS SE JÁ CONCLUIU
    if (data.status === "concluido") {
      router.replace(`/tecnico/servicos/${id}`);
      return;
    }

    setOs(data);
    setLoading(false);
  }

  async function salvarAntes() {
    const token = localStorage.getItem("token");
    const form = new FormData();

    form.append("relatorio", relatorio);
    form.append("observacao", observacao);
    fotos.forEach(f => form.append("fotos", f));

    await fetch(`${API_URL}/projects/tecnico/antes/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });

    // ✅ SÓ AGORA VAI PRO DEPOIS
    router.push(`/tecnico/servicos/${id}`);
  }

  if (loading) return <p>Carregando...</p>;
  if (!os) return <p>OS não encontrada</p>;

  return (
    <div className="p-6 bg-white">
      <h1 className="text-xl font-bold mb-4">ANTES – {os.osNumero}</h1>

      <label>Relatório inicial</label>
      <textarea className="border w-full mb-3" value={relatorio} onChange={e => setRelatorio(e.target.value)} />

      <label>Observações</label>
      <textarea className="border w-full mb-3" value={observacao} onChange={e => setObservacao(e.target.value)} />

      <label>📷 Fotos</label>
      <input type="file" accept="image/*" multiple onChange={e => setFotos(Array.from(e.target.files || []))} />

      <button className="mt-4 bg-green-600 text-white p-3 w-full" onClick={salvarAntes}>
        Salvar e ir para DEPOIS
      </button>
    </div>
  );
}
