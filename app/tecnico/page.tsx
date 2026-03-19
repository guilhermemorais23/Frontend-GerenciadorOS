"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CarFront, CircleStop, Eye, FileText, MapPinned, Pause, Play, X } from "lucide-react";
import { apiFetch, projectOsPath } from "@/app/lib/api";
import { formatDate, isFinishedStatus, normalizeStatus, statusBadgeClass, statusLabel, STATUS } from "@/app/lib/os";

type Servico = {
  _id: string;
  osNumero?: string;
  cliente?: string;
  subcliente?: string;
  Subcliente?: string;
  subgrupo?: string;
  unidade?: string;
  marca?: string;
  endereco?: string;
  telefone?: string;
  status?: string;
  data_abertura?: string;
  data_finalizacao_tecnico?: string;
  data_validacao_admin?: string;
  data_inicio_atendimento?: string;
  data_inicio_deslocamento?: string;
  data_fim_deslocamento?: string;
  deslocamento_concluido?: boolean;
  data_pausa_atendimento?: string;
  tipo_manutencao?: string;
  solicitante_nome?: string;
  prioridade?: string;
  detalhamento?: string;
};

export default function TecnicoPage() {
  const router = useRouter();
  const FILTRO_TODAS = "__TODAS__" as const;
  const FILTRO_FINALIZADAS = "__FINALIZADAS__" as const;

  type FiltroTecnico =
    | typeof FILTRO_TODAS
    | typeof STATUS.ABERTA
    | typeof STATUS.EM_ATENDIMENTO
    | typeof STATUS.PAUSADA
    | typeof FILTRO_FINALIZADAS;

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [filtro, setFiltro] = useState<FiltroTecnico>(FILTRO_TODAS);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [previewServico, setPreviewServico] = useState<Servico | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "tecnico") {
      router.replace("/login");
      return;
    }

    carregarServicos();
  }, [router]);

  async function carregarServicos() {
    try {
      const data = await apiFetch("/projects/tecnico/my");
      setServicos(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      alert("Erro ao carregar serviços: " + (err instanceof Error ? err.message : "erro desconhecido"));
    } finally {
      setLoading(false);
    }
  }

  async function mudarStatus(id: string, acao: "iniciar" | "pausar" | "retomar", redirecionarParaAntes = false) {
    try {
      const map: Record<"iniciar" | "pausar" | "retomar", string> = {
        iniciar: "start",
        pausar: "pause",
        retomar: "resume",
      };
      await apiFetch(projectOsPath(`/${id}/${map[acao]}`), { method: "POST" });
      if (acao === "iniciar" && redirecionarParaAntes) {
        router.push(`/tecnico/servicos/${id}/antes`);
        return;
      }
      await carregarServicos();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  }

  async function mudarDeslocamento(id: string, acao: "iniciar" | "finalizar") {
    try {
      const endpoint =
        acao === "iniciar"
          ? `/projects/tecnico/deslocamento/iniciar/${id}`
          : `/projects/tecnico/deslocamento/finalizar/${id}`;
      await apiFetch(endpoint, { method: "PUT" });
      await carregarServicos();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar deslocamento");
    }
  }

  function logout() {
    const ok = confirm("Deseja realmente sair?");
    if (!ok) return;

    localStorage.clear();
    router.push("/login");
  }

  const filtros: Array<{ label: string; value: FiltroTecnico }> = [
    { label: "Todas", value: FILTRO_TODAS },
    { label: "Abertas", value: STATUS.ABERTA },
    { label: "Em andamento", value: STATUS.EM_ATENDIMENTO },
    { label: "Pausadas", value: STATUS.PAUSADA },
    { label: "Finalizadas", value: FILTRO_FINALIZADAS },
  ];

  const listaFiltrada = useMemo(() => {
    const prioridadePeso: Record<string, number> = {
      ALTA: 0,
      MEDIA: 1,
      BAIXA: 2,
    };

    return servicos.filter((s) => {
      const status = normalizeStatus(s.status);
      const concluida = isFinishedStatus(s.status);
      const termo = busca.trim().toLowerCase();

      if (filtro === FILTRO_FINALIZADAS) {
        if (!concluida) return false;
      } else if (filtro === FILTRO_TODAS) {
        if (concluida) return false;
      } else {
        if (concluida) return false;
        if (status !== filtro) return false;
      }

      if (!termo) return true;
      const texto = [
        s.osNumero || "",
        s.cliente || "",
        s.solicitante_nome || "",
        s.subcliente || "",
        s.Subcliente || "",
        s.subgrupo || "",
        statusLabel(status),
      ]
        .join(" ")
        .toLowerCase();

      return texto.includes(termo);
    }).sort((a, b) => {
      if (filtro === FILTRO_FINALIZADAS) {
        const fa = new Date(a.data_validacao_admin || a.data_finalizacao_tecnico || a.data_abertura || 0).getTime();
        const fb = new Date(b.data_validacao_admin || b.data_finalizacao_tecnico || b.data_abertura || 0).getTime();
        if (fa !== fb) return fb - fa;
      }

      const pa = prioridadePeso[String(a.prioridade || "MEDIA").toUpperCase()] ?? 1;
      const pb = prioridadePeso[String(b.prioridade || "MEDIA").toUpperCase()] ?? 1;
      if (pa !== pb) return pa - pb;

      const ta = new Date(a.data_abertura || 0).getTime();
      const tb = new Date(b.data_abertura || 0).getTime();
      if (ta !== tb) return ta - tb;

      const oa = Number(String(a.osNumero || "").split("-")[0]) || 0;
      const ob = Number(String(b.osNumero || "").split("-")[0]) || 0;
      return oa - ob;
    });
  }, [servicos, filtro, busca]);

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6">Carregando...</div>;

  return (
    <div className="space-y-5 bg-[#f3f8ff] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Área técnica</p>
            <h1 className="text-2xl font-extrabold text-slate-900">Painel do Técnico</h1>
          </div>
          <button
            onClick={logout}
            className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-700 hover:bg-rose-100"
          >
            Sair
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {filtros.map((f) => (
            <button
              key={f.label}
              onClick={() => setFiltro(f.value)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                filtro === f.value
                  ? "bg-blue-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          className="mb-4 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
          placeholder="Pesquisar OS (cliente, número, solicitante...)"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />

        {listaFiltrada.length === 0 && (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            Nenhum serviço encontrado.
          </p>
        )}

        <div className="space-y-3">
          {listaFiltrada.map((s) => {
            const status = normalizeStatus(s.status);
            const atendimentoIniciado = Boolean(s.data_inicio_atendimento);
            const podeIniciarDeslocamento =
              !atendimentoIniciado && !s.data_inicio_deslocamento && !s.data_fim_deslocamento && !s.deslocamento_concluido;
            const podeFinalizarDeslocamento =
              !atendimentoIniciado && Boolean(s.data_inicio_deslocamento) && !s.data_fim_deslocamento && !s.deslocamento_concluido;
            return (
              <div key={s._id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-lg font-extrabold">{s.osNumero || "Sem OS"}</p>
                    <p className="text-sm font-semibold text-slate-700">{s.cliente || "Sem cliente"}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
                      Prioridade {String(s.prioridade || "MEDIA").toUpperCase()}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(status)}`}>
                      {statusLabel(status)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4">
                  <p>
                    <b>Solicitante:</b> {s.solicitante_nome || "-"}
                  </p>
                  <p>
                    <b>Tipo:</b> {s.tipo_manutencao || "-"}
                  </p>
                  <p>
                    <b>Prioridade:</b> {s.prioridade || "MEDIA"}
                  </p>
                  <p>
                    <b>Abertura:</b> {formatDate(s.data_abertura)}
                  </p>
                  <p>
                    <b>Início:</b> {formatDate(s.data_inicio_atendimento)}
                  </p>
                  <p className="sm:col-span-2 lg:col-span-4">
                    <b>Descrição:</b> {s.detalhamento || "-"}
                  </p>
                  <p className="sm:col-span-2 lg:col-span-4">
                    <b>Endereço:</b> {s.endereco || "-"}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => setPreviewServico(s)}
                    title="Preview"
                    aria-label="Preview"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  >
                    <Eye size={16} />
                  </button>

                  {s.endereco && (
                    <a
                      href={buildGpsHref(s.endereco)}
                      target="_blank"
                      rel="noreferrer"
                      title="Abrir GPS"
                      aria-label="Abrir GPS"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                    >
                      <MapPinned size={16} />
                    </a>
                  )}

                  {podeIniciarDeslocamento && (
                    <button
                      onClick={() => mudarDeslocamento(s._id, "iniciar")}
                      title="Iniciar deslocamento"
                      aria-label="Iniciar deslocamento"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 text-white hover:bg-amber-600"
                    >
                      <CarFront size={16} />
                    </button>
                  )}

                  {podeFinalizarDeslocamento && (
                    <button
                      onClick={() => mudarDeslocamento(s._id, "finalizar")}
                      title="Finalizar deslocamento"
                      aria-label="Finalizar deslocamento"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white hover:bg-amber-700"
                    >
                      <CircleStop size={16} />
                    </button>
                  )}

                  {status === STATUS.ABERTA && (
                    <button
                      onClick={() => mudarStatus(s._id, "iniciar", true)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
                    >
                      <Play size={16} />
                      Iniciar chamado
                    </button>
                  )}

                  {status === STATUS.EM_ATENDIMENTO && (
                    <button
                      onClick={() => mudarStatus(s._id, "pausar")}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700"
                    >
                      <Pause size={16} />
                      Pausar
                    </button>
                  )}

                  {status === STATUS.PAUSADA && (
                    <button
                      onClick={() => mudarStatus(s._id, "retomar")}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
                    >
                      <Play size={16} />
                      Retomar
                    </button>
                  )}

                  <button
                    onClick={() => router.push(`/tecnico/servicos/${s._id}`)}
                    title="Ver detalhes"
                    aria-label="Ver detalhes"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  >
                    <FileText size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewServico && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 p-3 sm:p-6">
          <div className="mx-auto flex h-full w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-extrabold text-slate-900">Preview da OS {previewServico.osNumero}</p>
                <p className="text-xs text-slate-500">Conferência rápida antes de abrir o detalhe completo</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewServico(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white hover:bg-slate-800"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-4 overflow-auto p-4 text-sm text-slate-700">
              <div className="grid gap-3 sm:grid-cols-2">
                <p><b>Cliente:</b> {previewServico.cliente || "-"}</p>
                <p><b>Solicitante:</b> {previewServico.solicitante_nome || "-"}</p>
                <p><b>Tipo:</b> {previewServico.tipo_manutencao || "-"}</p>
                <p><b>Status:</b> {statusLabel(previewServico.status)}</p>
                <p><b>Abertura:</b> {formatDate(previewServico.data_abertura)}</p>
                <p><b>Início:</b> {formatDate(previewServico.data_inicio_atendimento)}</p>
                <p className="sm:col-span-2"><b>Endereço:</b> {previewServico.endereco || "-"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-1 font-semibold text-slate-800">Detalhamento</p>
                <p className="whitespace-pre-line">{previewServico.detalhamento || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildGpsHref(endereco?: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(String(endereco || "").trim())}`;
}
