"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";

export default function EditarOSPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [marca, setMarca] = useState("");
  const [unidade, setUnidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [telefone, setTelefone] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [status, setStatus] = useState("aguardando_tecnico");

  const [tecnicos, setTecnicos] = useState<any[]>([]);
  const [tecnicoId, setTecnicoId] = useState("");

  // ===== ANTES =====
  const [antesRelatorio, setAntesRelatorio] = useState("");
  const [antesObs, setAntesObs] = useState("");
  const [antesFotos, setAntesFotos] = useState<string[]>([]);
  const [novasFotosAntes, setNovasFotosAntes] = useState<File[]>([]);

  // ===== DEPOIS =====
  const [depoisRelatorio, setDepoisRelatorio] = useState("");
  const [depoisObs, setDepoisObs] = useState("");
  const [depoisFotos, setDepoisFotos] = useState<string[]>([]);
  const [novasFotosDepois, setNovasFotosDepois] = useState<File[]>([]);

  useEffect(() => {
    carregarOS();
    carregarTecnicos();
  }, []);

  async function carregarOS() {
    try {
      const data = await apiFetch(`/projects/admin/view/${id}`);

      setCliente(data.cliente || "");
      setSubcliente(data.Subcliente || data.subgrupo || "");
      setMarca(data.marca || "");
      setUnidade(data.unidade || "");
      setEndereco(data.endereco || "");
      setTelefone(data.telefone || "");
      setDetalhamento(data.detalhamento || "");
      setStatus(data.status || "aguardando_tecnico");
      setTecnicoId(data.tecnico?._id || data.tecnico || "");

      setAntesRelatorio(data.antes?.relatorio || "");
      setAntesObs(data.antes?.observacao || "");
      setAntesFotos(data.antes?.fotos || []);

      setDepoisRelatorio(data.depois?.relatorio || "");
      setDepoisObs(data.depois?.observacao || "");
      setDepoisFotos(data.depois?.fotos || []);
    } catch (err: any) {
      alert("Erro ao carregar OS: " + err.message);
    } finally {
      setLoading(false);
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

  function removerFotoAntes(index: number) {
    setAntesFotos(antesFotos.filter((_, i) => i !== index));
  }

  function removerFotoDepois(index: number) {
    setDepoisFotos(depoisFotos.filter((_, i) => i !== index));
  }

  function handleNovasFotosAntes(files: FileList | null) {
    if (!files) return;
    setNovasFotosAntes(Array.from(files));
  }

  function handleNovasFotosDepois(files: FileList | null) {
    if (!files) return;
    setNovasFotosDepois(Array.from(files));
  }

  async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function salvarAlteracoes() {
    setSalvando(true);

    try {
      const novasAntesBase64 = [];
      for (const f of novasFotosAntes) novasAntesBase64.push(await fileToBase64(f));

      const novasDepoisBase64 = [];
      for (const f of novasFotosDepois) novasDepoisBase64.push(await fileToBase64(f));

      const payload = {
        cliente,
        Subcliente: subcliente,
        marca,
        unidade,
        endereco,
        telefone,
        detalhamento,
        status,
        tecnicoId,
        antes: {
          relatorio: antesRelatorio,
          observacao: antesObs,
          fotos: [...antesFotos, ...novasAntesBase64],
        },
        depois: {
          relatorio: depoisRelatorio,
          observacao: depoisObs,
          fotos: [...depoisFotos, ...novasDepoisBase64],
        },
      };

      await apiFetch(`/projects/admin/update/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      alert("OS atualizada com sucesso!");
      router.push(`/admin/servicos/${id}`);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  return (
    <div className="min-h-screen bg-gray-200 p-4 flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg p-6 space-y-6 text-black">

        <h1 className="text-2xl font-bold">Editar Ordem de Serviço</h1>

        {/* ===== ANTES ===== */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">ANTES</h2>

          <label>Relatório</label>
          <textarea className="border p-2 w-full mb-2"
            value={antesRelatorio}
            onChange={(e) => setAntesRelatorio(e.target.value)}
          />

          <label>Observação</label>
          <textarea className="border p-2 w-full mb-2"
            value={antesObs}
            onChange={(e) => setAntesObs(e.target.value)}
          />
        </div>

        {/* ===== DEPOIS ===== */}
        <div className="border rounded p-4">
          <h2 className="font-bold mb-2">DEPOIS</h2>

          <label>Relatório</label>
          <textarea className="border p-2 w-full mb-2"
            value={depoisRelatorio}
            onChange={(e) => setDepoisRelatorio(e.target.value)}
          />

          <label>Observação</label>
          <textarea className="border p-2 w-full"
            value={depoisObs}
            onChange={(e) => setDepoisObs(e.target.value)}
          />
        </div>

        <button
          onClick={salvarAlteracoes}
          disabled={salvando}
          className="bg-green-600 text-white py-3 rounded w-full text-lg"
        >
          {salvando ? "Salvando..." : "Salvar Alterações"}
        </button>

      </div>
    </div>
  );
}
