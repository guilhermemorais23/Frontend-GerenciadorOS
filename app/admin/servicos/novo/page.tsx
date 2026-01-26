"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function NovaOSPage() {
  const router = useRouter();

  const [clientes, setClientes] = useState<any[]>([]);
  const [tecnicos, setTecnicos] = useState<any[]>([]);

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState(""); // será a UNIDADE
  const [marca, setMarca] = useState("");
  const [unidade, setUnidade] = useState(""); // 🔥 NOVO
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [tecnicoId, setTecnicoId] = useState("");

  const [buscaDasa, setBuscaDasa] = useState("");
  const [listaRelacionada, setListaRelacionada] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarClientes();
    carregarTecnicos();
  }, []);

  async function carregarClientes() {
    const data = await apiFetch("/clientes");
    setClientes(data);
  }

  async function carregarTecnicos() {
    const data = await apiFetch("/auth/tecnicos");
    setTecnicos(data);
  }

  function selecionarCliente(nome: string) {
    setCliente(nome);
    setSubcliente("");
    setUnidade("");
    setMarca("");
    setEndereco("");
    setTelefone("");
    setBuscaDasa("");

    const relacionados = clientes.filter(
      (c) => c.cliente.toLowerCase() === nome.toLowerCase()
    );
    setListaRelacionada(relacionados);
  }

  function selecionarRelacionado(item: any) {
    setSubcliente(item.subcliente || "");
    setUnidade(item.subcliente || ""); // 🔥 ESSENCIAL
    setMarca(item.marca || "");
    setEndereco(item.endereco || "");
    setTelefone(item.telefone || "");
  }

  const isDASA = cliente.toLowerCase() === "dasa";

  async function salvarOS() {
    if (!cliente || !tecnicoId) {
      alert("Cliente e técnico são obrigatórios");
      return;
    }

    setLoading(true);

    try {
      await apiFetch("/projects/admin/create", {
        method: "POST",
        body: JSON.stringify({
          cliente,
          marca,
          unidade, // 🔥 AGORA VAI PRO BANCO
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

        <select
          className="border p-2 rounded w-full"
          value={cliente}
          onChange={(e) => selecionarCliente(e.target.value)}
        >
          <option value="">Selecione o cliente</option>
          {[...new Set(clientes.map((c) => c.cliente))].map((nome) => (
            <option key={nome} value={nome}>{nome}</option>
          ))}
        </select>

        {listaRelacionada.length > 0 && (
          <select
            className="border p-2 rounded w-full"
            value={subcliente}
            onChange={(e) => {
              const item = listaRelacionada.find(
                (i) => i.subcliente === e.target.value
              );
              if (item) selecionarRelacionado(item);
            }}
          >
            <option value="">Selecione a unidade</option>
            {listaRelacionada.map((c) => (
              <option key={c._id} value={c.subcliente}>
                {c.subcliente}
              </option>
            ))}
          </select>
        )}

        <input className="border p-2 rounded w-full bg-gray-100" value={`Marca: ${marca}`} readOnly />
        <input className="border p-2 rounded w-full bg-gray-100" value={`Unidade: ${unidade}`} readOnly />
        <input className="border p-2 rounded w-full bg-gray-100" value={endereco} readOnly />
        <input className="border p-2 rounded w-full bg-gray-100" value={telefone} readOnly />

        <textarea
          className="border p-2 rounded w-full"
          rows={4}
          placeholder="Detalhamento do serviço"
          value={detalhamento}
          onChange={(e) => setDetalhamento(e.target.value)}
        />

        <select
          className="border p-2 rounded w-full"
          value={tecnicoId}
          onChange={(e) => setTecnicoId(e.target.value)}
        >
          <option value="">Selecione o técnico</option>
          {tecnicos.map((t) => (
            <option key={t._id} value={t._id}>{t.nome}</option>
          ))}
        </select>

        <button
          onClick={salvarOS}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-3 rounded w-full"
        >
          {loading ? "Salvando..." : "Salvar OS"}
        </button>
      </div>
    </div>
  );
}
