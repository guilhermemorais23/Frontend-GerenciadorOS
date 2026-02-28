export const STATUS = {
  ABERTA: "ABERTA",
  EM_ATENDIMENTO: "EM_ATENDIMENTO",
  PAUSADA: "PAUSADA",
  FINALIZADA_PELO_TECNICO: "FINALIZADA_PELO_TECNICO",
  VALIDADA_PELO_ADMIN: "VALIDADA_PELO_ADMIN",
  CANCELADA: "CANCELADA",
} as const;

const LEGACY_TO_CURRENT: Record<string, string> = {
  aguardando_tecnico: STATUS.ABERTA,
  em_andamento: STATUS.EM_ATENDIMENTO,
  concluido: STATUS.FINALIZADA_PELO_TECNICO,
  cancelado: STATUS.CANCELADA,
};

export const STATUS_OPTIONS = [
  STATUS.ABERTA,
  STATUS.EM_ATENDIMENTO,
  STATUS.PAUSADA,
  STATUS.FINALIZADA_PELO_TECNICO,
  STATUS.VALIDADA_PELO_ADMIN,
  STATUS.CANCELADA,
];

export function normalizeStatus(status?: string | null) {
  if (!status) return STATUS.ABERTA;
  return LEGACY_TO_CURRENT[status] || status;
}

export function statusLabel(rawStatus?: string | null) {
  const status = normalizeStatus(rawStatus);

  if (status === STATUS.ABERTA) return "Aberta";
  if (status === STATUS.EM_ATENDIMENTO) return "Em atendimento";
  if (status === STATUS.PAUSADA) return "Pausada";
  if (status === STATUS.FINALIZADA_PELO_TECNICO) return "Finalizada pelo técnico";
  if (status === STATUS.VALIDADA_PELO_ADMIN) return "Validada pelo admin";
  if (status === STATUS.CANCELADA) return "Cancelada";
  return status;
}

export function statusBadgeClass(rawStatus?: string | null) {
  const status = normalizeStatus(rawStatus);

  if (status === STATUS.ABERTA) return "bg-amber-100 text-amber-700 border border-amber-200";
  if (status === STATUS.EM_ATENDIMENTO) return "bg-sky-100 text-sky-700 border border-sky-200";
  if (status === STATUS.PAUSADA) return "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200";
  if (status === STATUS.FINALIZADA_PELO_TECNICO) return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (status === STATUS.VALIDADA_PELO_ADMIN) return "bg-teal-100 text-teal-700 border border-teal-200";
  if (status === STATUS.CANCELADA) return "bg-rose-100 text-rose-700 border border-rose-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export function isOpenStatus(rawStatus?: string | null) {
  const status = normalizeStatus(rawStatus);
  const openStatuses: string[] = [STATUS.ABERTA, STATUS.EM_ATENDIMENTO, STATUS.PAUSADA];
  return openStatuses.includes(status);
}

export function formatDate(date?: string | null) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export const TIPO_MANUTENCAO = ["CORRETIVA", "PREVENTIVA", "VISTORIA"] as const;
export const MOTIVOS_NAO_ASSINOU = ["AUSENTE", "FERIAS", "NAO_QUIS_ASSINAR", "OUTROS"] as const;
