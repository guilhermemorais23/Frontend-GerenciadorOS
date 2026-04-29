"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileDown, FileText, LogOut, Plus, RefreshCcw } from "lucide-react";
import { API_URL, apiFetch } from "@/app/lib/api";
import { formatDate, getStatusAgeWarning, normalizeStatus, statusLabel, STATUS } from "@/app/lib/os";

type OSItem = {
  _id?: string;
  id?: string;
  osNumero?: string;
  cliente?: string;
  subcliente?: string;
  Subcliente?: string;
  unidade?: string;
  marca?: string;
  detalhamento?: string;
  solicitante_nome?: string;
  tipo_manutencao?: string;
  status?: string;
  data_abertura?: string;
  data_inicio_atendimento?: string | null;
  data_retomada_atendimento?: string | null;
  data_pausa_atendimento?: string | null;
  createdAt?: string;
  updatedAt?: string;
  data_validacao_admin?: string | null;
  tecnico?: { nome?: string } | string | null;
  tecnicoNome?: string;
  antes?: { fotos?: string[] } | null;
  depois?: { fotos?: string[] } | null;
};

type FiltroTab = "todas" | "abertas" | "concluidas";

function getPortalCacheKey() {
  const uid = localStorage.getItem("userId")?.trim();
  if (uid) return `portal-dashboard-cache:${uid}`;
  const token = localStorage.getItem("token")?.trim();
  if (token && token.length >= 24) {
    return `portal-dashboard-cache:t:${token.slice(0, 12)}:${token.slice(-12)}`;
  }
  return "portal-dashboard-cache:anon";
}

function clearLegacyPortalCacheKey() {
  sessionStorage.removeItem("terceiro-dashboard-cache");
}

export default function TerceiroPage() {
  const router = useRouter();
  const [cliente, setCliente] = useState("");
  const [subcliente, setSubcliente] = useState("");
  const [unidade, setUnidade] = useState("");
  const [lista, setLista] = useState<OSItem[]>([]);
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [baixandoId, setBaixandoId] = useState<string | null>(null);
  const [erroLista, setErroLista] = useState("");
  const [tab, setTab] = useState<FiltroTab>("todas");

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "terceiro" && role !== "cliente") {
      router.replace("/login");
      return;
    }

    clearLegacyPortalCacheKey();
    const cacheKey = getPortalCacheKey();

    setCliente(localStorage.getItem("cliente_vinculado") || "");
    setSubcliente(localStorage.getItem("subcliente_vinculado") || "");
    setUnidade(localStorage.getItem("unidade_vinculada") || "");

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached) as OSItem[];
        if (Array.isArray(parsed)) {
          setLista(parsed);
          setCarregandoLista(false);
        }
      }
    } catch {
      // noop
    }

    carregarDadosVinculados();
    carregarOS();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  async function carregarDadosVinculados() {
    try {
      const data = (await apiFetch("/clientes/vinculado/me")) as {
        cliente?: string;
        subcliente?: string;
        unidade?: string;
      };

      if (data.cliente) {
        setCliente(data.cliente);
        localStorage.setItem("cliente_vinculado", data.cliente);
      }
      if (data.subcliente) {
        setSubcliente(data.subcliente);
        localStorage.setItem("subcliente_vinculado", data.subcliente);
      }
      if (data.unidade) {
        setUnidade(data.unidade);
        localStorage.setItem("unidade_vinculada", data.unidade);
      }
    } catch {
      // noop
    }
  }

  async function carregarOS() {
    try {
      setErroLista("");
      setCarregandoLista(true);
      const data = await apiFetch("/projects/terceiro/my");
      const itens = Array.isArray(data) ? (data as OSItem[]) : [];
      setLista(itens);
      sessionStorage.setItem(getPortalCacheKey(), JSON.stringify(itens));
    } catch (err: unknown) {
      setErroLista(err instanceof Error ? err.message : "Erro ao carregar ordens de serviço");
    } finally {
      setCarregandoLista(false);
    }
  }

  async function baixarPDF(os: OSItem) {
    const osId = os._id || os.id;
    if (!osId) return;

    try {
      setBaixandoId(osId);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/os/${osId}/report?variant=client&force=true`, {
        method: "GET",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        cache: "no-store",
      });

      if (!res.ok) {
        const raw = await res.text();
        throw new Error(raw || "Erro ao baixar PDF");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `RELATORIO-OS-${os.osNumero || osId}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao baixar PDF");
    } finally {
      setBaixandoId(null);
    }
  }

  function sair() {
    sessionStorage.removeItem(getPortalCacheKey());
    clearLegacyPortalCacheKey();
    localStorage.clear();
    router.push("/login");
  }

  const contadores = useMemo(() => {
    let abertas = 0;
    let concluidas = 0;

    for (const os of lista) {
      if (normalizeStatus(os.status) === STATUS.VALIDADA_PELO_ADMIN) concluidas += 1;
      else abertas += 1;
    }

    return {
      total: lista.length,
      abertas,
      concluidas,
    };
  }, [lista]);

  const listaFiltrada = useMemo(() => {
    return lista.filter((os) => {
      const concluida = normalizeStatus(os.status) === STATUS.VALIDADA_PELO_ADMIN;
      if (tab === "abertas") return !concluida;
      if (tab === "concluidas") return concluida;
      return true;
    });
  }, [lista, tab]);

  return (
    <div className="min-h-screen bg-[#f3f8ff] px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Portal do cliente</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">Minhas ordens de serviço</h1>
              <p className="mt-1 text-sm text-slate-600">
                {cliente || "Cliente"}
                {subcliente || unidade ? ` - ${subcliente || unidade}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push("/terceiro/nova")}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-bold text-sky-800 transition hover:bg-sky-100"
              >
                <Plus size={16} />
                Nova solicitação
              </button>
              <button
                type="button"
                onClick={carregarOS}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCcw size={16} />
                Atualizar
              </button>
              <button
                type="button"
                onClick={sair}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
              >
                <LogOut size={16} />
                Sair
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <MetricCard titulo="Total" valor={contadores.total} />
            <MetricCard titulo="Abertas" valor={contadores.abertas} />
            <MetricCard titulo="Concluídas" valor={contadores.concluidas} />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <TabButton active={tab === "todas"} onClick={() => setTab("todas")}>Todas</TabButton>
            <TabButton active={tab === "abertas"} onClick={() => setTab("abertas")}>Abertas</TabButton>
            <TabButton active={tab === "concluidas"} onClick={() => setTab("concluidas")}>Concluídas</TabButton>
          </div>
        </section>

        {erroLista && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {erroLista}
          </div>
        )}

        <section className="space-y-4">
          {carregandoLista ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center text-slate-600">
              Carregando ordens de serviço...
            </div>
          ) : listaFiltrada.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-10 text-center text-slate-600">
              Nenhuma OS encontrada para este filtro.
            </div>
          ) : (
            listaFiltrada.map((os) => {
              const concluida = normalizeStatus(os.status) === STATUS.VALIDADA_PELO_ADMIN;
              const tecnicoNome =
                (typeof os.tecnico === "object" ? os.tecnico?.nome : os.tecnico) || os.tecnicoNome || "A definir";
              const osId = os._id || os.id || os.osNumero || "sem-id";
              const fotosTecnico = (os.depois?.fotos?.length || 0) + (os.antes?.fotos?.length || 0);
              const statusWarning = getStatusAgeWarning(os);

              return (
                <article key={osId} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">{os.tipo_manutencao || "Serviço"}</h2>
                      <p className="mt-1 text-sm font-semibold text-slate-600">{os.osNumero || "Sem número"}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        concluida ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {concluida ? "Concluída" : statusLabel(os.status)}
                    </span>
                  </div>

                  {statusWarning && (
                    <p className="mt-3 inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                      <AlertTriangle size={13} />
                      Mais de 24h em {statusWarning.statusLabel.toLowerCase()} ({statusWarning.hours}h)
                    </p>
                  )}

                  <div className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-4">
                    <InfoLine label="Abertura" value={formatDate(os.data_abertura || os.createdAt)} />
                    <InfoLine label="Solicitante" value={os.solicitante_nome || "-"} />
                    <InfoLine label="Técnico" value={tecnicoNome} />
                    <InfoLine label="Validação" value={formatDate(os.data_validacao_admin)} />
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold text-slate-900">Descrição</p>
                    <p className="mt-2 whitespace-pre-line">{os.detalhamento || "-"}</p>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-3">
                    <MiniStat label="Cliente" value={os.cliente || "-"} />
                    <MiniStat label="Local" value={os.subcliente || os.Subcliente || os.unidade || "-"} />
                    <MiniStat label="Fotos do técnico" value={String(fotosTecnico)} />
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600">
                      <FileText size={16} />
                      {concluida ? "OS validada pelo admin" : "OS em acompanhamento"}
                    </div>
                    <button
                      type="button"
                      disabled={!concluida || baixandoId === osId}
                      onClick={() => baixarPDF(os)}
                      className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <FileDown size={16} />
                      {baixandoId === osId ? "Baixando..." : concluida ? "Baixar PDF" : "Disponível após validação"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ titulo, valor }: { titulo: string; valor: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
      <p className="text-sm font-semibold text-slate-600">{titulo}</p>
      <p className="mt-3 text-5xl font-extrabold tracking-tight text-slate-900">{valor}</p>
    </div>
  );
}

function TabButton({ active, children, onClick }: { active: boolean; children: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
        active ? "border-sky-200 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold text-slate-900">{label}:</span> {value}
    </p>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
