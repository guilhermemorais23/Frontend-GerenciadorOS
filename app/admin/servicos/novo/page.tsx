"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

const DASA_LISTA = [
  { unidade: "PRAIME", marca: "CERPE" },
  { unidade: "João de Barros", marca: "CERPE" },
  { unidade: "Canela", marca: "NTO - Bahia" },
  { unidade: "ALDEOTA", marca: "LabPasteur" },
  { unidade: "VILA DO ATLANTICO", marca: "IMAGE" },
  { unidade: "CERPE GRAÇAS - HOSPITAL", marca: "CERPE" },
  { unidade: "JAIME DA FONTE", marca: "CERPE" },
  { unidade: "NTO-NORDESTE", marca: "CERPE" },
  { unidade: "BOA VIAGEM I", marca: "CERPE" },
  { unidade: "BOA VIAGEM II", marca: "CERPE" },
  { unidade: "IBURA", marca: "CERPE" },
  { unidade: "ABDIAS", marca: "CERPE" },
  { unidade: "Abreu Lima", marca: "CERPE" },
  { unidade: "DERBY 2", marca: "CERPE" },
  { unidade: "IPSEP", marca: "CERPE" },
  { unidade: "PIEDADE II", marca: "CERPE" },
  { unidade: "GOIANA", marca: "CERPE" },
  { unidade: "CASA CAIADA", marca: "CERPE" },
  { unidade: "IPOJUCA", marca: "CERPE" },
  { unidade: "PALMARES", marca: "CERPE" },
  { unidade: "RIBEIRÃO", marca: "CERPE" },
  { unidade: "SURUBIM", marca: "CERPE" },
  { unidade: "OLINDA", marca: "CERPE" },
  { unidade: "PAULISTA 2", marca: "CERPE" },
  { unidade: "SETUBAL", marca: "CERPE" },
  { unidade: "GRAVATA", marca: "CERPE" },
  { unidade: "BOA VIAGEM", marca: "BORIS BERENSTEIN" },
  { unidade: "PIEDADE", marca: "BORIS BERENSTEIN" },
  { unidade: "MESSEJANA", marca: "LabPasteur" },
  { unidade: "BEZERRA DE MENEZES", marca: "LabPasteur" },
  { unidade: "PARANGABA", marca: "LabPasteur" },
  { unidade: "FATIMA", marca: "LabPasteur" },
  { unidade: "OLIVEIRA PAIVA", marca: "LabPasteur" },
  { unidade: "RENASCENÇA", marca: "GASPAR" },
  { unidade: "ANJO DA GUARDA", marca: "GASPAR" },
  { unidade: "CALHAU", marca: "GASPAR" },
  { unidade: "ITAJARA", marca: "IMAGE MEMORIAL" },
  { unidade: "Campo Grande", marca: "IMAGE MEMORIAL" },
  { unidade: "LE-SÃO MARCOS", marca: "LEME" },
  { unidade: "CANELA", marca: "LEME" },
  { unidade: "GARIBALDI", marca: "LEME" },
  { unidade: "PATAMARES", marca: "LEME" },
  { unidade: "CABULA", marca: "LEME" },
  { unidade: "IMBUI", marca: "LEME" },
  { unidade: "NTO-ADM", marca: "LEME" },
  { unidade: "ITAIGARA", marca: "LEME" },
  { unidade: "VILA DO ATLANTICO", marca: "LEME" },
  { unidade: "MEMORIAL", marca: "IMAGE" },
  { unidade: "DERBY", marca: "CERPE" },
  { unidade: "CAXANGA", marca: "CERPE" },
  { unidade: "MADALENA - PRIME", marca: "CERPE - PRAIME" },
  { unidade: "BEBERIBE", marca: "CERPE" },
  { unidade: "Graças", marca: "CERPE" },
  { unidade: "GRAVATÁ", marca: "CERPE" },
  { unidade: "Igarassu", marca: "CERPE" },
  { unidade: "CE NTH RECIFE", marca: "CERPE" },
  { unidade: "Jaboatão", marca: "CERPE" },
  { unidade: "Janga", marca: "CERPE" },
  { unidade: "NTH - ADM", marca: "CERPE" },
  { unidade: "PRAZERES", marca: "CERPE" },
  { unidade: "Setubal II", marca: "CERPE" },
  { unidade: "IMBIRIBEIRA", marca: "NTO - Recife" },
  { unidade: "Jardim São Paulo", marca: "CERPE" },
  { unidade: "HOLANDESES", marca: "GASPAR" },
  { unidade: "JP Gaspar", marca: "GASPAR" },
  { unidade: "LEME", marca: "IMAGE" },
  { unidade: "ARMAZEM", marca: "LABPASTEUR" },
  { unidade: "Itapoã", marca: "LEME" },
  { unidade: "SÃO MARCOS", marca: "LEME" },
  { unidade: "ONDINA", marca: "NTO - Recife" },
  { unidade: "STELLA MARIS", marca: "LEME" },
  { unidade: "CABO DE SANTO AGOSTINHO", marca: "BORIS BERENSTEIN" },
  { unidade: "JAQUEIRA", marca: "CERPE" },
  { unidade: "CARPINA", marca: "CERPE" },
  { unidade: "CAMINHO DE AREIA", marca: "LEME" },
  { unidade: "COSTA AZUL", marca: "LEME" },
  { unidade: "CAMINHO DAS ARVORES", marca: "LEME" },
  { unidade: "JARDINS", marca: "GASPAR" },
  { unidade: "JARDINS PRIME", marca: "GASPAR" },
];

export default function NovaOSPage() {
  const router = useRouter();

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [subclientes, setSubclientes] = useState<any[]>([]);
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [marca, setMarca] = useState("");
  const [unidade, setUnidade] = useState("");
  const [detalhamento, setDetalhamento] = useState("");

  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [tecnicoId, setTecnicoId] = useState("");

  const [loading, setLoading] = useState(false);

  const [buscaDasa, setBuscaDasa] = useState("");
  const [mostrarListaDasa, setMostrarListaDasa] = useState(false);

  useEffect(() => {
    carregarTecnicos();
  }, []);

  async function carregarTecnicos() {
    try {
      const data = await apiFetch("/auth/tecnicos");
      setTecnicos(data);
    } catch {
      alert("Erro ao carregar técnicos");
    }
  }

  async function carregarSubclientes(nomeCliente: string) {
    try {
      const data = await apiFetch(`/clientes/by-cliente/${nomeCliente}`);
      setSubclientes(data);
    } catch {
      setSubclientes([]);
    }
  }

  const isDASA = cliente.trim().toLowerCase() === "dasa";

  const listaFiltrada = DASA_LISTA.filter((item) =>
    `${item.unidade} ${item.marca}`.toLowerCase().includes(buscaDasa.toLowerCase())
  );

  function selecionarDasa(item: { unidade: string; marca: string }) {
    setUnidade(item.unidade);
    setMarca(item.marca);
    setMostrarListaDasa(false);
    setBuscaDasa("");
  }

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
          subcliente,
          endereco,
          telefone,
          marca: isDASA ? marca : "",
          unidade: isDASA ? unidade : "",
          detalhamento,
          tecnicoId,
        }),
      });

      alert("OS criada com sucesso!");
      router.push("/admin");
    } catch (err: any) {
      alert("Erro: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 text-black">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
          <button
            onClick={() => router.push("/admin")}
            className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
          >
            Voltar
          </button>
        </div>

        {/* CLIENTE */}
        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Cliente (ex: DASA ou Brinks)"
          value={cliente}
          onChange={(e) => {
            const valor = e.target.value;
            setCliente(valor);

            if (valor.trim().toLowerCase() === "dasa") {
              setMostrarListaDasa(true);
              setSubclientes([]);
              setSubcliente("");
            } else {
              setMostrarListaDasa(false);
              setBuscaDasa("");
              setUnidade("");
              setMarca("");
              carregarSubclientes(valor);
            }
          }}
        />

        {/* SUBCLIENTE (para clientes normais como Brinks) */}
        {subclientes.length > 0 && !isDASA && (
          <select
            className="border p-2 rounded w-full mb-3"
            value={subcliente}
            onChange={(e) => setSubcliente(e.target.value)}
          >
            <option value="">Selecione o subcliente</option>
            {subclientes.map((s) => (
              <option key={s._id} value={s.subcliente}>
                {s.subcliente}
              </option>
            ))}
          </select>
        )}

        {/* LISTA DASA */}
        {isDASA && mostrarListaDasa && (
          <div className="border rounded p-3 mb-4 bg-gray-50">
            <p className="font-semibold mb-2">Selecionar Unidade / Marca (DASA)</p>

            <input
              className="border p-2 rounded w-full mb-3"
              placeholder="Buscar unidade ou marca..."
              value={buscaDasa}
              onChange={(e) => setBuscaDasa(e.target.value)}
            />

            <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
              {listaFiltrada.map((item, index) => (
                <div
                  key={index}
                  onClick={() => selecionarDasa(item)}
                  className="cursor-pointer p-2 rounded border bg-white hover:bg-blue-100"
                >
                  <b>{item.unidade}</b> — {item.marca}
                </div>
              ))}

              {listaFiltrada.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum resultado encontrado</p>
              )}
            </div>
          </div>
        )}

        {/* UNIDADE */}
        {isDASA && (
          <input
            className="border p-2 rounded w-full mb-3 bg-gray-100"
            placeholder="Unidade"
            value={unidade}
            readOnly
          />
        )}

        {/* MARCA */}
        {isDASA && (
          <input
            className="border p-2 rounded w-full mb-3 bg-gray-100"
            placeholder="Marca"
            value={marca}
            readOnly
          />
        )}

        {/* ENDEREÇO */}
        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Endereço"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
        />

        {/* TELEFONE */}
        <input
          className="border p-2 rounded w-full mb-3"
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
        />

        {/* DETALHAMENTO */}
        <textarea
          className="border p-2 rounded w-full mb-4"
          rows={4}
          placeholder="Detalhamento do serviço"
          value={detalhamento}
          onChange={(e) => setDetalhamento(e.target.value)}
        />

        {/* TÉCNICO */}
        <select
          className="border p-2 rounded w-full mb-6"
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
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg w-full"
        >
          {loading ? "Salvando..." : "Salvar OS"}
        </button>

      </div>
    </div>
  );
}
