"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function NovoClientePage() {
  const router = useRouter();

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function salvarCliente() {
    if (!cliente) {
      alert("Cliente é obrigatório");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/clientes", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          subcliente,
          telefone,
          email,
        }),
      });

      alert("Cliente salvo com sucesso!");
      router.push("/admin/clientes");

    } catch (err: any) {
      alert("Erro ao salvar cliente: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 text-black">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">

        {/* TOPO */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Novo Cliente</h1>

          <button
            onClick={() => router.back()}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1.5 rounded-lg transition"
          >
            Voltar
          </button>
        </div>

        {/* CLIENTE */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Cliente
          </label>
          <input
            className="w-full border border-gray-400 rounded-lg p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Brinks"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />
        </div>

        {/* SUBCLIENTE */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Subcliente
          </label>
          <input
            className="w-full border border-gray-400 rounded-lg p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Brinks Recife"
            value={subcliente}
            onChange={(e) => setSubcliente(e.target.value)}
          />
        </div>

        {/* TELEFONE */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Telefone
          </label>
          <input
            className="w-full border border-gray-400 rounded-lg p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(81) 99999-9999"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-800 mb-1">
            Email
          </label>
          <input
            className="w-full border border-gray-400 rounded-lg p-2 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="cliente@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* BOTÃO */}
        <button
          onClick={salvarCliente}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-60"
        >
          {loading ? "Salvando..." : "Salvar Cliente"}
        </button>
      </div>
    </div>
  );
}
