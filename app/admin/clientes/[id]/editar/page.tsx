"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function EditarClientePage() {
  const isProductionDeploy = process.env.NODE_ENV === "production";
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarCliente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarCliente() {
    try {
      const data = await apiFetch(`/clientes/${id}`);
      setCliente(data.cliente || "");
      setSubcliente(data.subcliente || "");
      setTelefone(data.telefone || "");
      setEmail(data.email || "");
    } catch {
      alert("Erro ao carregar cliente");
    } finally {
      setLoading(false);
    }
  }

  async function salvar() {
    setSalvando(true);

    try {
      await apiFetch(`/clientes/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          cliente,
          subcliente,
          telefone,
          ...(isProductionDeploy ? {} : { email }),
        }),
      });

      alert("Cliente atualizado com sucesso!");
      router.push("/admin/clientes");
    } catch {
      alert("Erro ao salvar cliente");
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4 text-black">Editar Cliente</h1>

        <input className="border p-2 rounded w-full mb-3" placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />

        <input className="border p-2 rounded w-full mb-3" placeholder="Subcliente" value={subcliente} onChange={(e) => setSubcliente(e.target.value)} />

        <input className="border p-2 rounded w-full mb-3" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

        {!isProductionDeploy && (
          <input className="border p-2 rounded w-full mb-4" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        )}

        <div className="flex gap-2">
          <button
            onClick={salvar}
            disabled={salvando}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            {salvando ? "Salvando..." : "Salvar"}
          </button>

          <button
            onClick={() => router.push("/admin/clientes")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
