"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/app/lib/api";

export default function AdminClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    try {
      const data = await apiFetch("/clientes");
      setClientes(data);
    } catch {
      alert("Erro ao carregar clientes");
    } finally {
      setLoading(false);
    }
  }

  async function criarCliente() {
    if (!cliente) {
      alert("Cliente é obrigatório");
      return;
    }

    try {
      await apiFetch("/clientes", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          subcliente,
          endereco,
          telefone,
          email,
        }),
      });

      alert("Cliente criado com sucesso!");
      setCliente("");
      setSubcliente("");
      setEndereco("");
      setTelefone("");
      setEmail("");
      carregarClientes();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function excluirCliente(id: string) {
    const ok = confirm("Deseja excluir este cliente?");
    if (!ok) return;

    try {
      await apiFetch(`/clientes/${id}`, { method: "DELETE" });
      carregarClientes();
    } catch {
      alert("Erro ao excluir");
    }
  }

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">

        <h1 className="text-2xl font-bold">Clientes</h1>

        {/* FORM CRIAR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            className="border p-2 rounded"
            placeholder="Cliente (ex: DASA, BRINKS)"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Subcliente / Unidade"
            value={subcliente}
            onChange={(e) => setSubcliente(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Endereço"
            value={endereco}
            onChange={(e) => setEndereco(e.target.value)}
          />

          <input
            className="border p-2 rounded"
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
          />

          <input
            className="border p-2 rounded md:col-span-2"
            placeholder="Email (opcional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <button
          onClick={criarCliente}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded"
        >
          Salvar Cliente
        </button>

        {/* LISTA */}
        <div className="border-t pt-6 space-y-3">
          {clientes.map((c) => (
            <div
              key={c._id}
              className="border rounded p-4 flex flex-col md:flex-row md:justify-between gap-2"
            >
              <div className="text-sm space-y-1">
                <div><b>Cliente:</b> {c.cliente}</div>
                {c.subcliente && <div><b>Subcliente:</b> {c.subcliente}</div>}
                {c.endereco && <div><b>Endereço:</b> {c.endereco}</div>}
                {c.telefone && <div><b>Telefone:</b> {c.telefone}</div>}
              </div>

              <button
                onClick={() => excluirCliente(c._id)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
              >
                Excluir
              </button>
            </div>
          ))}

          {clientes.length === 0 && (
            <p className="text-gray-600">Nenhum cliente cadastrado.</p>
          )}
        </div>

      </div>
    </div>
  );
}
