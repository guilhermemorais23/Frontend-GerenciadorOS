"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, CarFront, CircleStop, MapPinned, Pause, Phone, Play } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { normalizeImageSrc } from "@/app/lib/image-url";
import { formatDate, formatDuration, priorityBadgeClass, priorityLabel, statusBadgeClass, statusLabel, normalizeStatus, STATUS } from "@/app/lib/os";
import { clearOsSessionKeys, osDetailCacheKey, readSessionJson, writeSessionJson } from "@/app/lib/os-session";

type HistoricoBloco = {
  relatorio?: string;
  observacao?: string;
  fotos_nao_autorizadas?: boolean;
  fotos?: string[];
};

type ServicoDetalhe = {
  osNumero?: string;
  cliente?: string;
  subcliente?: string;
  status?: string;
  solicitante_nome?: string;
  tipo_manutencao?: string;
  prioridade?: string;
  orcamento_previsto?: string;
  equipamento_nome?: string;
  equipamento_fabricante?: string;
  equipamento_modelo?: string;
  equipamento_numero_serie?: string;
  equipamento_patrimonio?: string;
  equipamento_especificacoes?: string;
  data_abertura?: string;
  data_inicio_atendimento?: string;
  data_pausa_atendimento?: string;
  data_retomada_atendimento?: string;
  data_inicio_deslocamento?: string;
  data_fim_deslocamento?: string;
  deslocamento_segundos?: number;
  detalhamento?: string;
  antes?: HistoricoBloco;
  depois?: HistoricoBloco;
  botao_gps_endereco?: string;
  botao_ligar_telefone?: string;
  problem_photo_url?: string;
  foto_abertura?: string;
  materiais_solicitados?: MaterialSolicitado[];
};

type MaterialSolicitado = {
  nome?: string;
  fabricante?: string;
  modelo?: string;
  quantidade?: number;
  unidade?: string;
  observacao?: string;
};

export default function ServicoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const returnTo = searchParams.get("returnTo");

  const [os, setOs] = useState<ServicoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = readSessionJson<ServicoDetalhe>(osDetailCacheKey("tecnico", id));
    if (cached) {
      setOs(cached);
      setLoading(false);
    } else {
      setLoading(true);
      setOs(null);
    }
    void carregarOS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function carregarOS() {
    try {
      const data = (await apiFetch(`/projects/tecnico/view/${id}`)) as ServicoDetalhe;
      setOs(data);
      writeSessionJson(osDetailCacheKey("tecnico", id), data);
    } catch {
      setOs(null);
    } finally {
      setLoading(false);
    }
  }

  async function mudarStatus(acao: "iniciar" | "pausar" | "retomar") {
    try {
      const map: Record<"iniciar" | "pausar" | "retomar", string> = {
        iniciar: "start",
        pausar: "pause",
        retomar: "resume",
      };
      await apiFetch(`/os/${id}/${map[acao]}`, { method: "POST" });
      clearOsSessionKeys();
      await carregarOS();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar status");
    }
  }

  async function mudarDeslocamento(acao: "iniciar" | "finalizar") {
    try {
      const endpoint =
        acao === "iniciar"
          ? `/projects/tecnico/deslocamento/iniciar/${id}`
          : `/projects/tecnico/deslocamento/finalizar/${id}`;
      await apiFetch(endpoint, { method: "PUT" });
      clearOsSessionKeys();
      await carregarOS();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao atualizar deslocamento");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">Carregando...</div>
      </div>
    );
  }
  if (!os) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">OS não encontrada</div>
      </div>
    );
  }

  const status = normalizeStatus(os.status);
  const canGoDepois = status === STATUS.EM_ATENDIMENTO || status === STATUS.PAUSADA;

  return (
    <div className="min-h-screen p-4 text-slate-900 sm:p-6">
      <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">OS {os.osNumero}</h1>
            <p className="text-sm text-slate-600">{os.cliente}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(status)}`}>
            <span className="inline-flex items-center gap-1">
              {status === STATUS.FINALIZADA_COM_PENDENCIA && <AlertTriangle size={13} />}
              {statusLabel(status)}
            </span>
          </span>
        </div>

        {status === STATUS.FINALIZADA_COM_PENDENCIA && (
          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm font-semibold text-orange-900">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Esta OS foi finalizada com pendência e aguarda validação do admin.</p>
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
          <p><b>Subcliente:</b> {os.subcliente || "-"}</p>
          <p><b>Solicitante:</b> {os.solicitante_nome || "-"}</p>
          <p><b>Tipo:</b> {os.tipo_manutencao || "-"}</p>
          <p>
            <b>Prioridade:</b>{" "}
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${priorityBadgeClass(os.prioridade)}`}>
              {priorityLabel(os.prioridade)}
            </span>
          </p>
          <p><b>Equipamento:</b> {os.equipamento_nome || "-"}</p>
          <p><b>Fabricante:</b> {os.equipamento_fabricante || "-"}</p>
          <p><b>Modelo:</b> {os.equipamento_modelo || "-"}</p>
          <p><b>Número de série:</b> {os.equipamento_numero_serie || "-"}</p>
          <p><b>Patrimônio:</b> {os.equipamento_patrimonio || "-"}</p>
          <p><b>Orçamento previsto:</b> {os.orcamento_previsto || "-"}</p>
          <p><b>Abertura:</b> {formatDate(os.data_abertura)}</p>
          <p><b>Início:</b> {formatDate(os.data_inicio_atendimento)}</p>
          <p><b>Pausa:</b> {formatDate(os.data_pausa_atendimento)}</p>
          <p><b>Retomada:</b> {formatDate(os.data_retomada_atendimento)}</p>
        </div>

        {os.equipamento_especificacoes && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-1 text-sm font-semibold text-slate-700">Especificações técnicas</p>
            <p className="whitespace-pre-line text-sm text-slate-700">{os.equipamento_especificacoes}</p>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
          <p className="mb-1 text-sm font-semibold text-sky-700">Detalhamento do serviço</p>
          <p className="whitespace-pre-line text-sm text-slate-700">{os.detalhamento || "-"}</p>
        </div>

        {(os.problem_photo_url || os.foto_abertura) && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">Foto enviada na solicitação</p>
            <img
              src={normalizeImageSrc(String(os.problem_photo_url || os.foto_abertura || ""))}
              alt="Foto da solicitação"
              className="h-44 w-full max-w-sm rounded-lg object-cover"
            />
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {!os.data_inicio_deslocamento || os.data_fim_deslocamento ? (
            <button
              onClick={() => mudarDeslocamento("iniciar")}
              title="Iniciar deslocamento"
              aria-label="Iniciar deslocamento"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800 transition hover:bg-amber-100"
            >
              <CarFront size={16} />
            </button>
          ) : (
            <button
              onClick={() => mudarDeslocamento("finalizar")}
              title="Finalizar deslocamento"
              aria-label="Finalizar deslocamento"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-amber-300 bg-amber-100 text-amber-900 transition hover:bg-amber-200"
            >
              <CircleStop size={16} />
            </button>
          )}

          {status === STATUS.ABERTA && (
            <button
              onClick={() => mudarStatus("iniciar")}
              title="Iniciar atendimento"
              aria-label="Iniciar atendimento"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 transition hover:bg-sky-100"
            >
              <Play size={16} />
            </button>
          )}

          {status === STATUS.EM_ATENDIMENTO && (
            <button
              onClick={() => mudarStatus("pausar")}
              title="Pausar"
              aria-label="Pausar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-violet-200 bg-violet-50 text-violet-800 transition hover:bg-violet-100"
            >
              <Pause size={16} />
            </button>
          )}

          {status === STATUS.PAUSADA && (
            <button
              onClick={() => mudarStatus("retomar")}
              title="Retomar"
              aria-label="Retomar"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-800 transition hover:bg-sky-100"
            >
              <Play size={16} />
            </button>
          )}

          <button
            onClick={() => router.push(`/tecnico/servicos/${id}/antes${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
            className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-100"
          >
            Registrar ANTES
          </button>

          <button
            onClick={() => router.push(`/tecnico/servicos/${id}/depois${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`)}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400"
            disabled={!canGoDepois}
          >
            Registrar DEPOIS e Finalizar
          </button>

          <button
            onClick={() => {
              if (returnTo) {
                router.push(returnTo);
                return;
              }
              router.push("/tecnico");
            }}
            title="Voltar"
            aria-label="Voltar"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p><b>Início deslocamento:</b> {formatDate(os.data_inicio_deslocamento)}</p>
          <p><b>Fim deslocamento:</b> {formatDate(os.data_fim_deslocamento)}</p>
          <p><b>Tempo deslocamento:</b> {formatDuration(os.deslocamento_segundos)}</p>
        </div>

        {(os.botao_gps_endereco || os.botao_ligar_telefone) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {os.botao_gps_endereco && (
              <a
                href={os.botao_gps_endereco}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <MapPinned size={16} />
                Abrir GPS
              </a>
            )}
            {os.botao_ligar_telefone && (
              <a
                href={os.botao_ligar_telefone}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Phone size={16} />
                Ligar
              </a>
            )}
          </div>
        )}

        <div className="mt-6 grid gap-5 border-t border-slate-200 pt-5 lg:grid-cols-2">
          <SectionHistorico titulo="ANTES" bloco={os.antes} />
          <SectionHistorico titulo="DEPOIS" bloco={os.depois} />
        </div>

        {Array.isArray(os.materiais_solicitados) && os.materiais_solicitados.length > 0 && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm font-extrabold text-slate-800">Materiais necessários</p>
            <div className="space-y-2">
              {os.materiais_solicitados.map((m, idx) => (
                <div key={`${m.nome || "material"}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">{m.nome || "-"}</p>
                  <p>
                    {(m.quantidade ?? 0)} {m.unidade || "un"}
                    {m.fabricante ? ` | ${m.fabricante}` : ""}
                    {m.modelo ? ` | ${m.modelo}` : ""}
                  </p>
                  {m.observacao ? <p>{m.observacao}</p> : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SectionHistorico({ titulo, bloco }: { titulo: string; bloco?: HistoricoBloco }) {
  return (
    <div className="space-y-2">
      <h2 className="text-base font-extrabold text-slate-800">{titulo}</h2>
      <p className="text-sm"><b>Parecer:</b> {bloco?.relatorio || "-"}</p>
      {bloco?.observacao ? <p className="text-sm"><b>Observação:</b> {bloco.observacao}</p> : null}
      {bloco?.fotos_nao_autorizadas ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
          Fotografias não autorizadas.
        </p>
      ) : null}

      {bloco?.fotos && bloco.fotos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {bloco.fotos.map((f, i) => (
            <img key={i} src={normalizeImageSrc(f)} alt={`${titulo} foto ${i + 1}`} className="h-28 w-full rounded-lg object-cover" />
          ))}
        </div>
      )}
    </div>
  );
}
