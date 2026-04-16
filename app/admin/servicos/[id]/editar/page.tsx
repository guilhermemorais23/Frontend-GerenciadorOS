"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { apiFetch } from "@/app/lib/api";
import { PRIORIDADES, TIPO_MANUTENCAO } from "@/app/lib/os";

type Tecnico = { _id: string; nome: string };

type HistoricoBloco = {
  relatorio?: string;
  observacao?: string;
  fotos?: string[];
};

type SolicitanteVinculado = {
  _id: string;
  nome: string;
  cliente: string;
  subcliente?: string;
  unidade?: string;
  marca?: string;
  telefone?: string;
  email?: string;
};

type EquipamentoCatalogo = {
  _id: string;
  nome: string;
  fabricante?: string;
  modelo?: string;
  numero_serie?: string;
  patrimonio?: string;
  especificacoes_tecnicas?: string;
};

type OSDetalhe = {
  cliente?: string;
  subcliente?: string;
  marca?: string;
  unidade?: string;
  endereco?: string;
  email?: string;
  telefone?: string;
  detalhamento?: string;
  solicitante_nome?: string;
  tipo_manutencao?: (typeof TIPO_MANUTENCAO)[number];
  prioridade?: (typeof PRIORIDADES)[number];
  tecnico?: { _id?: string };
  foto_abertura?: string;
  problem_photo_url?: string;
  antes?: HistoricoBloco | null;
  depois?: HistoricoBloco | null;
  orcamento_previsto?: string;
  equipamento_nome?: string;
  equipamento_fabricante?: string;
  equipamento_modelo?: string;
  equipamento_numero_serie?: string;
  equipamento_patrimonio?: string;
  equipamento_especificacoes?: string;
};

function photoSrc(raw?: string) {
  const u = String(raw || "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `data:image/jpeg;base64,${u}`;
}

export default function EditarOSPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const returnTo = searchParams.get("returnTo");

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [marca, setMarca] = useState("");
  const [unidade, setUnidade] = useState("");
  const [endereco, setEndereco] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [detalhamento, setDetalhamento] = useState("");
  const [solicitanteNome, setSolicitanteNome] = useState("");
  const [tipoManutencao, setTipoManutencao] = useState<(typeof TIPO_MANUTENCAO)[number]>("CORRETIVA");
  const [prioridade, setPrioridade] = useState<(typeof PRIORIDADES)[number]>("MEDIA");
  const [tecnicos, setTecnicos] = useState<Tecnico[]>([]);
  const [tecnicoId, setTecnicoId] = useState("");
  const [fotoProblema, setFotoProblema] = useState("");

  const [solicitantesVinculados, setSolicitantesVinculados] = useState<SolicitanteVinculado[]>([]);
  const [solicitanteVinculadoId, setSolicitanteVinculadoId] = useState("");
  const [salvandoSolicitante, setSalvandoSolicitante] = useState(false);

  const [antesRelatorio, setAntesRelatorio] = useState("");
  const [antesObs, setAntesObs] = useState("");
  const [antesFotos, setAntesFotos] = useState<string[]>([]);
  const [depoisRelatorio, setDepoisRelatorio] = useState("");
  const [depoisObs, setDepoisObs] = useState("");
  const [depoisFotos, setDepoisFotos] = useState<string[]>([]);
  const [uploadingAntes, setUploadingAntes] = useState(false);
  const [uploadingDepois, setUploadingDepois] = useState(false);

  const [incluirPecaCatalogo, setIncluirPecaCatalogo] = useState(false);
  const [catalogoEquipamentos, setCatalogoEquipamentos] = useState<EquipamentoCatalogo[]>([]);
  const [equipamentoCatalogoId, setEquipamentoCatalogoId] = useState("");
  const [equipamentoNome, setEquipamentoNome] = useState("");
  const [equipamentoFabricante, setEquipamentoFabricante] = useState("");
  const [equipamentoModelo, setEquipamentoModelo] = useState("");
  const [equipamentoNumeroSerie, setEquipamentoNumeroSerie] = useState("");
  const [equipamentoPatrimonio, setEquipamentoPatrimonio] = useState("");
  const [equipamentoEspecificacoes, setEquipamentoEspecificacoes] = useState("");
  const [orcamentoPrevisto, setOrcamentoPrevisto] = useState("");

  const isDasa = cliente.trim().toLowerCase() === "dasa";

  useEffect(() => {
    carregarOS();
    carregarTecnicos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!incluirPecaCatalogo) return;
    apiFetch("/catalog/equipamentos")
      .then((data) => setCatalogoEquipamentos(Array.isArray(data) ? (data as EquipamentoCatalogo[]) : []))
      .catch(() => setCatalogoEquipamentos([]));
  }, [incluirPecaCatalogo]);

  useEffect(() => {
    carregarSolicitantesVinculados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente, subcliente, unidade, marca]);

  async function carregarSolicitantesVinculados() {
    const clienteTrim = cliente.trim();
    if (!clienteTrim) {
      setSolicitantesVinculados([]);
      setSolicitanteVinculadoId("");
      return;
    }
    const clienteEhDasa = clienteTrim.toLowerCase() === "dasa";
    try {
      const data = await apiFetch(
        `/solicitantes/vinculados?cliente=${encodeURIComponent(clienteTrim)}&subcliente=${encodeURIComponent(
          clienteEhDasa ? "" : (subcliente || "").trim()
        )}&unidade=${encodeURIComponent(clienteEhDasa ? (unidade || "").trim() : "")}&marca=${encodeURIComponent(
          clienteEhDasa ? (marca || "").trim() : ""
        )}&limit=100`
      );
      const lista = Array.isArray(data) ? (data as SolicitanteVinculado[]) : [];
      setSolicitantesVinculados(lista);
      if (!lista.some((s) => s._id === solicitanteVinculadoId)) {
        setSolicitanteVinculadoId("");
      }
    } catch {
      setSolicitantesVinculados([]);
      setSolicitanteVinculadoId("");
    }
  }

  async function carregarOS() {
    try {
      const data = (await apiFetch(`/projects/admin/view/${id}`)) as OSDetalhe;

      setCliente(data.cliente || "");
      setSubcliente(data.subcliente || "");
      setMarca(data.marca || "");
      setUnidade(data.unidade || "");
      setEndereco(data.endereco || "");
      setEmail(data.email || "");
      setTelefone(data.telefone || "");
      setDetalhamento(data.detalhamento || "");
      setSolicitanteNome(data.solicitante_nome || "");
      setTipoManutencao(data.tipo_manutencao || "CORRETIVA");
      setPrioridade(data.prioridade || "MEDIA");
      setTecnicoId(data.tecnico?._id || "");
      setFotoProblema(data.problem_photo_url || data.foto_abertura || "");

      const a = data.antes;
      setAntesRelatorio(a?.relatorio || "");
      setAntesObs(a?.observacao || "");
      setAntesFotos(Array.isArray(a?.fotos) ? a!.fotos! : []);

      const d = data.depois;
      setDepoisRelatorio(d?.relatorio || "");
      setDepoisObs(d?.observacao || "");
      setDepoisFotos(Array.isArray(d?.fotos) ? d!.fotos! : []);

      const temEquip =
        Boolean(data.equipamento_nome?.trim()) ||
        Boolean(data.orcamento_previsto?.trim()) ||
        data.tipo_manutencao === "PREVENTIVA";
      setIncluirPecaCatalogo(temEquip);
      setEquipamentoNome(data.equipamento_nome || "");
      setEquipamentoFabricante(data.equipamento_fabricante || "");
      setEquipamentoModelo(data.equipamento_modelo || "");
      setEquipamentoNumeroSerie(data.equipamento_numero_serie || "");
      setEquipamentoPatrimonio(data.equipamento_patrimonio || "");
      setEquipamentoEspecificacoes(data.equipamento_especificacoes || "");
      setOrcamentoPrevisto(data.orcamento_previsto || "");
    } catch (err: unknown) {
      alert("Erro ao carregar OS: " + (err instanceof Error ? err.message : "erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function carregarTecnicos() {
    const data = await apiFetch("/auth/tecnicos");
    setTecnicos(Array.isArray(data) ? (data as Tecnico[]) : []);
  }

  function selecionarSolicitanteVinculado(sid: string) {
    setSolicitanteVinculadoId(sid);
    const item = solicitantesVinculados.find((s) => s._id === sid);
    if (!item) return;
    setSolicitanteNome(item.nome || "");
    if (item.telefone) setTelefone(item.telefone);
    if (item.email) setEmail(item.email);
  }

  async function vincularSolicitanteAtual() {
    const clienteAtual = cliente.trim();
    const nomeAtual = solicitanteNome.trim();
    if (!clienteAtual) {
      alert("Informe o cliente antes de vincular o solicitante");
      return;
    }
    if (!nomeAtual) {
      alert("Informe o nome do solicitante");
      return;
    }
    setSalvandoSolicitante(true);
    try {
      const salvo = (await apiFetch("/solicitantes/vinculados", {
        method: "POST",
        body: JSON.stringify({
          nome: nomeAtual,
          cliente: clienteAtual,
          subcliente: (subcliente || "").trim(),
          unidade: isDasa ? (unidade || "").trim() : "",
          marca: isDasa ? (marca || "").trim() : "",
          telefone: (telefone || "").trim(),
          email: (email || "").trim(),
        }),
      })) as SolicitanteVinculado;

      await carregarSolicitantesVinculados();
      if (salvo?._id) setSolicitanteVinculadoId(salvo._id);
      alert("Solicitante vinculado com sucesso.");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao vincular solicitante");
    } finally {
      setSalvandoSolicitante(false);
    }
  }

  function selecionarEquipamento(eqId: string) {
    setEquipamentoCatalogoId(eqId);
    const eq = catalogoEquipamentos.find((item) => item._id === eqId);
    if (!eq) return;
    setEquipamentoNome(eq.nome || "");
    setEquipamentoFabricante(eq.fabricante || "");
    setEquipamentoModelo(eq.modelo || "");
    setEquipamentoNumeroSerie(eq.numero_serie || "");
    setEquipamentoPatrimonio(eq.patrimonio || "");
    setEquipamentoEspecificacoes(eq.especificacoes_tecnicas || "");
  }

  async function uploadFotos(section: "antes" | "depois", files: FileList | null) {
    if (!files?.length) return;
    const setBusy = section === "antes" ? setUploadingAntes : setUploadingDepois;
    setBusy(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("fotos", f));
      fd.append("section", section);
      const res = (await apiFetch(`/projects/admin/upload-attachment/${id}`, {
        method: "POST",
        body: fd,
      })) as { urls?: string[] };
      const urls = Array.isArray(res?.urls) ? res.urls : [];
      if (section === "antes") setAntesFotos((prev) => [...prev, ...urls]);
      else setDepoisFotos((prev) => [...prev, ...urls]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro no upload");
    } finally {
      setBusy(false);
    }
  }

  async function salvarAlteracoes() {
    setSalvando(true);

    try {
      const usarCatalogo = incluirPecaCatalogo;
      await apiFetch(`/projects/admin/update/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          cliente,
          subcliente,
          marca: isDasa ? marca : "",
          unidade: isDasa ? unidade : "",
          endereco,
          email,
          telefone,
          detalhamento,
          tecnicoId,
          solicitante_nome: solicitanteNome,
          tipo_manutencao: tipoManutencao,
          prioridade,
          antes: {
            relatorio: antesRelatorio,
            observacao: antesObs,
            fotos: antesFotos,
          },
          depois: {
            relatorio: depoisRelatorio,
            observacao: depoisObs,
            fotos: depoisFotos,
          },
          equipamento_catalogo_id: usarCatalogo ? equipamentoCatalogoId : "",
          equipamento_nome: usarCatalogo ? equipamentoNome : "",
          equipamento_fabricante: usarCatalogo ? equipamentoFabricante : "",
          equipamento_modelo: usarCatalogo ? equipamentoModelo : "",
          equipamento_numero_serie: usarCatalogo ? equipamentoNumeroSerie : "",
          equipamento_patrimonio: usarCatalogo ? equipamentoPatrimonio : "",
          equipamento_especificacoes: usarCatalogo ? equipamentoEspecificacoes : "",
          orcamento_previsto: usarCatalogo ? orcamentoPrevisto : "",
        }),
      });

      router.push(`/admin/servicos/${id}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`);
    } catch (err: unknown) {
      alert("Erro ao salvar: " + (err instanceof Error ? err.message : "erro desconhecido"));
    } finally {
      setSalvando(false);
    }
  }

  if (loading) return <div className="p-6 text-center">Carregando...</div>;

  const fotoUrl = photoSrc(fotoProblema);

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="mx-auto w-full max-w-3xl space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-slate-900">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-extrabold">Editar ordem de serviço</h1>
          <button
            type="button"
            onClick={() => {
              if (returnTo) {
                router.push(returnTo);
                return;
              }
              router.back();
            }}
            className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100"
          >
            Voltar
          </button>
        </div>

        <p className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          Revise a solicitação, o encaminhamento e os registros do técnico (antes/depois). Ao reabrir a OS, o histórico
          permanece visível para correção.
        </p>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Dados do cliente</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} />
            <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Subcliente" value={subcliente} onChange={(e) => setSubcliente(e.target.value)} />
            {isDasa && (
              <>
                <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Marca" value={marca} onChange={(e) => setMarca(e.target.value)} />
                <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Unidade" value={unidade} onChange={(e) => setUnidade(e.target.value)} />
              </>
            )}
            <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Endereço" value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
            <input className="rounded-xl border border-slate-200 bg-white p-2.5" placeholder="Solicitante (nome)" value={solicitanteNome} onChange={(e) => setSolicitanteNome(e.target.value)} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-semibold">Solicitante vinculado ao cliente</span>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5"
                value={solicitanteVinculadoId}
                onChange={(e) => selecionarSolicitanteVinculado(e.target.value)}
              >
                <option value="">Selecionar (preenche telefone e e-mail)</option>
                {solicitantesVinculados.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.nome}
                  </option>
                ))}
              </select>
            </label>
            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={vincularSolicitanteAtual}
                disabled={salvandoSolicitante}
                className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-100 disabled:opacity-60"
              >
                {salvandoSolicitante ? "Salvando..." : "Vincular solicitante nesta empresa"}
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Encaminhamento</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <select className="rounded-xl border border-slate-200 p-2.5" value={tipoManutencao} onChange={(e) => setTipoManutencao(e.target.value as (typeof TIPO_MANUTENCAO)[number])}>
              {TIPO_MANUTENCAO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <select className="rounded-xl border border-slate-200 p-2.5" value={tecnicoId} onChange={(e) => setTecnicoId(e.target.value)}>
              <option value="">Selecione o técnico</option>
              {tecnicos.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.nome}
                </option>
              ))}
            </select>

            <select className="rounded-xl border border-slate-200 p-2.5 sm:col-span-2" value={prioridade} onChange={(e) => setPrioridade(e.target.value as (typeof PRIORIDADES)[number])}>
              {PRIORIDADES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </section>

        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
          <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={incluirPecaCatalogo} onChange={(e) => setIncluirPecaCatalogo(e.target.checked)} />
          Incluir / editar peça do catálogo nesta OS
        </label>

        {incluirPecaCatalogo && (
          <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-lg font-extrabold text-slate-900">Catálogo / equipamento</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Equipamento do catálogo</span>
              <select
                className="w-full rounded-xl border border-slate-200 p-2.5"
                value={equipamentoCatalogoId}
                onChange={(e) => selecionarEquipamento(e.target.value)}
              >
                <option value="">Selecione um equipamento</option>
                {catalogoEquipamentos.map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.nome} {eq.fabricante ? `- ${eq.fabricante}` : ""}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-slate-200 p-2.5" placeholder="Nome" value={equipamentoNome} onChange={(e) => setEquipamentoNome(e.target.value)} />
              <input className="rounded-xl border border-slate-200 p-2.5" placeholder="Fabricante" value={equipamentoFabricante} onChange={(e) => setEquipamentoFabricante(e.target.value)} />
              <input className="rounded-xl border border-slate-200 p-2.5" placeholder="Modelo" value={equipamentoModelo} onChange={(e) => setEquipamentoModelo(e.target.value)} />
              <input className="rounded-xl border border-slate-200 p-2.5" placeholder="Número de série" value={equipamentoNumeroSerie} onChange={(e) => setEquipamentoNumeroSerie(e.target.value)} />
              <input className="rounded-xl border border-slate-200 p-2.5 sm:col-span-2" placeholder="Patrimônio / TAG" value={equipamentoPatrimonio} onChange={(e) => setEquipamentoPatrimonio(e.target.value)} />
              <textarea className="w-full rounded-xl border border-slate-200 p-2.5 sm:col-span-2" rows={3} placeholder="Especificações" value={equipamentoEspecificacoes} onChange={(e) => setEquipamentoEspecificacoes(e.target.value)} />
              <input className="rounded-xl border border-slate-200 p-2.5 sm:col-span-2" placeholder="Orçamento previsto" value={orcamentoPrevisto} onChange={(e) => setOrcamentoPrevisto(e.target.value)} />
            </div>
          </section>
        )}

        {fotoUrl && (
          <section className="space-y-2">
            <h2 className="text-lg font-extrabold">Foto na abertura da OS</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <img src={fotoUrl} alt="Foto da solicitacao" className="h-32 w-full rounded-lg object-cover" />
            </div>
          </section>
        )}

        <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Antes (técnico)</h2>
          <textarea className="w-full rounded-xl border border-slate-200 bg-white p-2.5" rows={4} placeholder="Relatório / parecer inicial" value={antesRelatorio} onChange={(e) => setAntesRelatorio(e.target.value)} />
          <textarea className="w-full rounded-xl border border-slate-200 bg-white p-2.5" rows={3} placeholder="Observação" value={antesObs} onChange={(e) => setAntesObs(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              Adicionar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingAntes}
                onChange={(e) => {
                  uploadFotos("antes", e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {uploadingAntes && <span className="text-sm text-slate-600">Enviando...</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {antesFotos.map((u, idx) => (
              <div key={`${u}-${idx}`} className="relative">
                <img src={u} alt="" className="h-28 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white"
                  onClick={() => setAntesFotos((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <h2 className="text-lg font-extrabold text-slate-900">Depois (técnico)</h2>
          <textarea className="w-full rounded-xl border border-slate-200 bg-white p-2.5" rows={4} placeholder="Relatório / parecer final" value={depoisRelatorio} onChange={(e) => setDepoisRelatorio(e.target.value)} />
          <textarea className="w-full rounded-xl border border-slate-200 bg-white p-2.5" rows={3} placeholder="Observação" value={depoisObs} onChange={(e) => setDepoisObs(e.target.value)} />
          <div className="flex flex-wrap gap-2">
            <label className="cursor-pointer rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold hover:bg-slate-50">
              Adicionar fotos
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploadingDepois}
                onChange={(e) => {
                  uploadFotos("depois", e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            {uploadingDepois && <span className="text-sm text-slate-600">Enviando...</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {depoisFotos.map((u, idx) => (
              <div key={`${u}-d-${idx}`} className="relative">
                <img src={u} alt="" className="h-28 w-full rounded-lg object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-rose-600 px-2 py-0.5 text-xs font-bold text-white"
                  onClick={() => setDepoisFotos((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </section>

        <textarea
          className="w-full rounded-xl border border-slate-200 p-2.5"
          rows={5}
          placeholder="Descrição inicial e encaminhamento para o técnico"
          value={detalhamento}
          onChange={(e) => setDetalhamento(e.target.value)}
        />

        <button
          onClick={salvarAlteracoes}
          disabled={salvando}
          className="mt-2 w-full rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {salvando ? "Salvando..." : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}
