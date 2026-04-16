"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/app/lib/api";
import { normalizeStatus, STATUS } from "@/app/lib/os";

type Metrics = {
  month?: string;
  total_abertas?: number;
  total_em_atendimento?: number;
  total_pausadas?: number;
  total_finalizadas_tecnico?: number;
  total_fechadas?: number;
  total_pendentes?: number;
};

type OSItem = {
  status?: string;
  createdAt?: string;
  data_abertura?: string;
  cliente?: string;
  subcliente?: string;
  Subcliente?: string;
  subgrupo?: string;
  unidade?: string;
  marca?: string;
};

export default function AdminGraficosPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [loading, setLoading] = useState(true);
  const [osList, setOsList] = useState<OSItem[]>([]);
  const [escopoFiltro, setEscopoFiltro] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const raw = await apiFetch("/projects/admin/all");
        if (!cancelled) setOsList(Array.isArray(raw) ? (raw as OSItem[]) : []);
      } catch {
        if (!cancelled) setOsList([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const metrics = useMemo(() => buildMetricsFromList(osList, month, escopoFiltro), [osList, month, escopoFiltro]);

  const slices = useMemo(
    () => [
      { key: "Abertas", value: Number(metrics?.total_abertas || 0), color: "#f59e0b" },
      { key: "Em andamento", value: Number(metrics?.total_em_atendimento || 0), color: "#0284c7" },
      { key: "Pausadas", value: Number(metrics?.total_pausadas || 0), color: "#9333ea" },
      {
        key: "Pendentes",
        value:
          Number(metrics?.total_abertas || 0) +
          Number(metrics?.total_em_atendimento || 0) +
          Number(metrics?.total_pausadas || 0),
        color: "#4f46e5",
      },
      {
        key: "Finalizadas",
        value: Number(metrics?.total_finalizadas_tecnico || 0) + Number(metrics?.total_fechadas || 0),
        color: "#0f766e",
      },
    ],
    [metrics]
  );

  const total = slices.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = 80;
  const stroke = 40;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  const escoposUnicos = useMemo(() => {
    const map = new Map<string, string>();
    osList.forEach((o) => {
      const escopo = getEscopoFromOs(o);
      if (!escopo) return;
      if (!map.has(escopo.key)) {
        map.set(escopo.key, escopo.label);
      }
    });
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [osList]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="block text-sm font-semibold text-slate-700">Mês</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-2 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        />
        <label className="mt-4 block text-sm font-semibold text-slate-700">Cliente / Escopo</label>
        <select
          value={escopoFiltro}
          onChange={(e) => setEscopoFiltro(e.target.value)}
          className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
        >
          <option value="">Todos</option>
          {escoposUnicos.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Carregando metricas...</p>
        ) : (
          <div className="space-y-5">
            <div className="mx-auto flex justify-center">
              <svg width="220" height="220" viewBox="0 0 220 220" aria-label="Grafico de pizza">
                <circle cx="110" cy="110" r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
                {slices.map((item) => {
                  const frac = item.value / total;
                  const dash = frac * circumference;
                  const offset = circumference - cumulative;
                  cumulative += dash;
                  return (
                    <circle
                      key={item.key}
                      cx="110"
                      cy="110"
                      r={radius}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={stroke}
                      strokeDasharray={`${dash} ${circumference - dash}`}
                      strokeDashoffset={offset}
                      transform="rotate(-90 110 110)"
                      strokeLinecap="butt"
                    />
                  );
                })}
                <circle cx="110" cy="110" r="46" fill="#ffffff" />
                <text x="110" y="104" textAnchor="middle" className="fill-slate-500 text-[12px] font-semibold">
                  Total
                </text>
                <text x="110" y="124" textAnchor="middle" className="fill-slate-800 text-[18px] font-extrabold">
                  {total}
                </text>
              </svg>
            </div>

            <div className="grid gap-2">
              {slices.map((item) => {
                const pct = Math.round((item.value / total) * 100);
                return (
                  <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-semibold text-slate-700">{item.key}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800">{item.value}</p>
                      <p className="text-xs text-slate-500">{pct}%</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function normalizeScopeValue(value?: string) {
  return String(value || "").trim().toLowerCase();
}

function getEscopoFromOs(item: OSItem): { key: string; label: string } | null {
  const cliente = String(item.cliente || "").trim();
  if (!cliente) return null;

  const clienteNorm = normalizeScopeValue(cliente);
  if (clienteNorm === "dasa") {
    const unidade = String(item.unidade || "").trim();
    const marca = String(item.marca || "").trim();
    return {
      key: `dasa|${normalizeScopeValue(unidade)}|${normalizeScopeValue(marca)}`,
      label: `DASA - Unidade: ${unidade || "-"} | Marca: ${marca || "-"}`,
    };
  }

  const subcliente = String(item.subcliente || item.Subcliente || item.subgrupo || "").trim();
  return {
    key: `${clienteNorm}|${normalizeScopeValue(subcliente)}`,
    label: subcliente ? `${cliente} - ${subcliente}` : `${cliente} - (sem subcliente)`,
  };
}

function buildMetricsFromList(list: OSItem[], month: string, escopoFiltro?: string): Metrics {
  const ef = String(escopoFiltro || "").trim();
  const filtered = list.filter((item) => {
    const escopoItem = getEscopoFromOs(item);
    if (ef && escopoItem?.key !== ef) return false;
    const rawDate = item.data_abertura || item.createdAt;
    if (!rawDate) return false;
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return false;
    return date.toISOString().slice(0, 7) === month;
  });

  const total_abertas = filtered.filter((o) => normalizeStatus(o.status) === STATUS.ABERTA).length;
  const total_em_atendimento = filtered.filter((o) => normalizeStatus(o.status) === STATUS.EM_ATENDIMENTO).length;
  const total_pausadas = filtered.filter((o) => normalizeStatus(o.status) === STATUS.PAUSADA).length;
  const total_finalizadas_tecnico = filtered.filter(
    (o) => normalizeStatus(o.status) === STATUS.FINALIZADA_PELO_TECNICO
  ).length;
  const total_fechadas = filtered.filter((o) => normalizeStatus(o.status) === STATUS.VALIDADA_PELO_ADMIN).length;

  return {
    month,
    total_abertas,
    total_em_atendimento,
    total_pausadas,
    total_finalizadas_tecnico,
    total_fechadas,
    total_pendentes: total_abertas + total_em_atendimento + total_pausadas,
  };
}
