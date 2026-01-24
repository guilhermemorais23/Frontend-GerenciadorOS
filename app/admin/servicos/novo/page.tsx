"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function NovaOSPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [subclientes, setSubclientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const [cliente, setCliente] = useState("");
  const [subclienteId, setSubclienteId] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarClientes();
    carregarTecnicos();
  }, []);

  async function carregarClientes() {
    try {
      const data = await apiFetch("/clientes");
      setClientes(data);
    } catch {
      alert("Erro ao carregar clientes");
    }
  }

  async function carregarTecnicos() {
    try {
      const data = await apiFetch("/auth/tecnicos");
      setTecnicos(data);
    } catch {
      alert("Erro ao carregar técnicos");
    }
  }

  function selecionarCliente(nome: string) {
    setCliente(nome);
    setSubclienteId("");
    setEndereco("");
    setTelefone("");

    const lista = clientes.filter(
      (c) => c.cliente.toLowerCase() === nome.toLowerCase()
    );

    setSubclientes(lista);
  }

  function selecionarSubcliente(id: string) {
    setSubclienteId(id);

    const selecionado = subclientes.find((s) => s._id === id);
    if (selecionado) {
      setEndereco(selecionado.endereco || "");
      setTelefone(selecionado.telefone || "");
    }
  }

  async function salvarOS() {
    if (!cliente || !tecnicoId) {
      alert("Cliente e técnico são obrigatórios");
      return;
    }

    const sub = subclientes.find((s) => s._id === subclienteId);

    setLoading(true);

    try {
      await apiFetch("/projects/admin/create", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          subcliente: sub?.subcliente || "",
          endereco,
          telefone,
          detalhamento,
          tecnicoId,
        }),
      });

      alert("OS criada com sucesso!");
      router.push("/admin");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6 space-y-4">

        <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>

        {/* CLIENTE */}
        <select
          className="border p-2 rounded w-full"
          value={cliente}
          onChange={(e) => selecionarCliente(e.target.value)}
        >
          <option value="">Selecione o cliente</option>
          {[...new Set(clientes.map((c) => c.cliente))].map((nome) => (
            <option key={nome} value={nome}>
              {nome}
            </option>
          ))}
        </select>

        {/* SUBCLIENTE */}
        {subclientes.length > 0 && (
          <select
            className="border p-2 rounded w-full"
            value={subclienteId}
            onChange={(e) => selecionarSubcliente(e.target.value)}
          >
            <option value="">Selecione o subcliente</option>
            {subclientes.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subcliente || "Sem subcliente"}
              </option>
            ))}
          </select>
        )}

        {/* ENDEREÇO */}
        <input
          className="border p-2 rounded w-full bg-gray-100"
          placeholder="Endereço"
          value={endereco}
          readOnly
        />

        {/* TELEFONE */}
        <input
          className="border p-2 rounded w-full bg-gray-100"
          placeholder="Telefone"
          value={telefone}
          readOnly
        />

        {/* DETALHAMENTO */}
        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          placeholder="Detalhamento do serviço"
          value={detalhamento}
          onChange={(e) => setDetalhamento(e.target.value)}
        />

        {/* TÉCNICO */}
        <select
          className="border p-2 rounded w-full"
          value={tecnicoId}
          onChange={(e) => setTecnicoId(e.target.value)}
        >
          <option value="">Selecione o técnico</option>
          {tecnicos.map((t) => (
            <option key={t._id} value={t._id}>
              {t.nome}
            </option>
          ))}
        </select>

        <button
          onClick={salvarOS}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded w-full"
        >
          {loading ? "Salvando..." : "Salvar OS"}
        </button>

      </div>
    </div>
  );
}
