"use client";

import { useEffect, useState } from "react";
import { Database, RefreshCw } from "lucide-react";
import { apiFetch } from "@/app/lib/api";

type StorageEstimateResponse = {
  mode?: "supabase" | "mongo";
  target_mb?: number;
  target_bytes?: number;
  db_size_bytes?: number;
  projects_table_bytes?: number;
  total_os?: number;
  avg_os_row_bytes?: number;
  estimated_os_to_delete?: number;
  message?: string;
};

function formatBytes(value?: number) {
  const bytes = Number(value || 0);
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

export default function BancoDeDadosPage() {
  const [storageEstimate, setStorageEstimate] = useState<StorageEstimateResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void carregarEstimativa();
  }, []);

  async function carregarEstimativa() {
    setRefreshing(true);
    try {
      const estimate = (await apiFetch("/dashboard/storage-estimate?targetMb=450")) as StorageEstimateResponse;
      setStorageEstimate(estimate && typeof estimate === "object" ? estimate : null);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao carregar estimativa de banco");
      setStorageEstimate(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (loading) {
    return <div className="rounded-2xl border border-slate-200 bg-white p-6">Carregando...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <Database size={22} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Banco de dados</p>
              <h2 className="text-xl font-extrabold text-slate-900">Estimativa de armazenamento</h2>
              <p className="mt-1 text-sm text-slate-600">
                Consulta feita sob demanda para evitar chamadas repetidas no dashboard principal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={carregarEstimativa}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} />
            {refreshing ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      {storageEstimate ? (
        <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StatBox label="Modo" value={storageEstimate.mode || "-"} />
            <StatBox label="Total de OS" value={String(storageEstimate.total_os || 0)} />
            <StatBox label="Banco atual" value={formatBytes(storageEstimate.db_size_bytes)} />
            <StatBox label="Tabela projects" value={formatBytes(storageEstimate.projects_table_bytes)} />
            <StatBox label="Média por OS" value={formatBytes(storageEstimate.avg_os_row_bytes)} />
            <StatBox label={`Alvo ${storageEstimate.target_mb || 450} MB`} value={formatBytes(storageEstimate.target_bytes)} />
            <StatBox label="OS estimadas para excluir" value={String(storageEstimate.estimated_os_to_delete || 0)} />
          </div>
          {storageEstimate.message && (
            <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-900">
              {storageEstimate.message}
            </p>
          )}
        </div>
      ) : (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
          Nenhuma estimativa disponível.
        </p>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
