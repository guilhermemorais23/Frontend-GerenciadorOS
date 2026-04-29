"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { apiFetch } from "@/app/lib/api";
import { formatDate, getStatusAgeWarning, statusBadgeClass, statusLabel } from "@/app/lib/os";

type Servico = {
  _id: string;
  osNumero?: string;
  cliente?: string;
  status?: string;
  data_abertura?: string;
  data_inicio_atendimento?: string | null;
  data_retomada_atendimento?: string | null;
  data_pausa_atendimento?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export default function AdminServicosPage() {
  const router = useRouter();
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      router.push("/login");
      return;
    }

    carregar();
  }, [router]);

  async function carregar() {
    try {
      const data = await apiFetch("/projects/admin/all");
      const list = Array.isArray(data) ? data : [];
      setServicos(list);
      setSelectedIds((prev) => prev.filter((id) => list.some((item) => item._id === id)));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao carregar servicos";
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function excluirSelecionadas(ids: string[]) {
    if (!ids.length) return;

    const plural = ids.length > 1;
    const ok = confirm(
      plural
        ? `Tem certeza que deseja EXCLUIR ${ids.length} OS selecionadas? Essa acao nao pode ser desfeita.`
        : "Tem certeza que deseja EXCLUIR esta OS? Essa acao nao pode ser desfeita."
    );
    if (!ok) return;

    setDeleting(true);
    try {
      const removedIds: string[] = [];
      const failedMessages: string[] = [];

      // Evita disparar dezenas de requests em paralelo (proxy/servidor podem recusar em massa).
      for (const id of ids) {
        try {
          await apiFetch(`/projects/admin/delete/${id}`, { method: "DELETE" });
          removedIds.push(id);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Erro ao excluir OS";
          failedMessages.push(message);
        }
      }

      const failedCount = ids.length - removedIds.length;

      if (removedIds.length) {
        setServicos((prev) => prev.filter((s) => !removedIds.includes(s._id)));
        setSelectedIds((prev) => prev.filter((id) => !removedIds.includes(id)));
      }

      if (failedCount > 0) {
        const details =
          failedMessages.length > 0
            ? `\nMotivo: ${failedMessages[0]}`
            : "";
        alert(
          `Algumas OS nao puderam ser excluidas (${failedCount} de ${ids.length}). Tente novamente nas que restaram.${details}`
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao excluir OS";
      alert(message);
    } finally {
      setDeleting(false);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      setSelectedIds(servicos.map((s) => s._id));
      return;
    }
    setSelectedIds([]);
  }

  if (loading) return <p className="rounded-2xl border border-slate-200 bg-white p-4">Carregando...</p>;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="inline-flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={servicos.length > 0 && selectedIds.length === servicos.length}
            onChange={(e) => toggleSelectAll(e.target.checked)}
            className="h-5 w-5 cursor-pointer accent-blue-700"
          />
          Selecionar todas
        </label>

        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {selectedIds.length} selecionada{selectedIds.length === 1 ? "" : "s"}
          </span>
          <button
            onClick={() => excluirSelecionadas(selectedIds)}
            disabled={!selectedIds.length || deleting}
            className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? "Excluindo..." : "Excluir selecionadas"}
          </button>
        </div>
      </div>

      {servicos.map((s) => {
        const statusWarning = getStatusAgeWarning(s);

        return (
          <div key={s._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                <label className="mt-0.5 inline-flex cursor-pointer items-center rounded-md p-1">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s._id)}
                    onChange={() => toggleSelection(s._id)}
                    className="h-5 w-5 cursor-pointer accent-blue-700"
                  />
                </label>

                <div>
                  <p className="text-lg font-extrabold text-slate-900">{s.osNumero}</p>
                  <p className="text-sm text-slate-700">{s.cliente}</p>
                  <p className="text-xs text-slate-500">Abertura: {formatDate(s.data_abertura)}</p>
                </div>
              </div>

              <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusBadgeClass(s.status)}`}>
                {statusLabel(s.status)}
              </span>
            </div>

            {statusWarning && (
              <p className="mt-3 inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-red-700">
                <AlertTriangle size={13} />
                Mais de 10h em {statusWarning.statusLabel.toLowerCase()} ({statusWarning.hours}h)
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                onClick={() => router.push(`/admin/servicos/${s._id}`)}
                className="rounded-xl bg-slate-800 px-3 py-2 text-sm font-bold text-white"
              >
                Ver
              </button>
              <button
                onClick={() => excluirSelecionadas([s._id])}
                disabled={deleting}
                className="rounded-xl bg-rose-700 px-3 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Excluir
              </button>
            </div>
          </div>
        );
      })}

      {!servicos.length && (
        <p className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Nenhuma OS encontrada.
        </p>
      )}
    </div>
  );
}
