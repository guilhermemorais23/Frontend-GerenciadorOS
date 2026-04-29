export const STATUS = {
  ABERTA: "ABERTA",
  EM_ATENDIMENTO: "EM_ATENDIMENTO",
  PAUSADA: "PAUSADA",
  FINALIZADA_PELO_TECNICO: "FINALIZADA_PELO_TECNICO",
  FINALIZADA_COM_PENDENCIA: "FINALIZADA_COM_PENDENCIA",
  VALIDADA_PELO_ADMIN: "VALIDADA_PELO_ADMIN",
  CANCELADA: "CANCELADA",
} as const;

const LEGACY_TO_CURRENT: Record<string, string> = {
  aguardando_tecnico: STATUS.ABERTA,
  aberta: STATUS.ABERTA,
  em_andamento: STATUS.EM_ATENDIMENTO,
  em_atendimento: STATUS.EM_ATENDIMENTO,
  pausada: STATUS.PAUSADA,
  pausado: STATUS.PAUSADA,
  finalizada_pelo_tecnico: STATUS.FINALIZADA_PELO_TECNICO,
  finalizada_com_pendencia: STATUS.FINALIZADA_COM_PENDENCIA,
  finalizacao_com_pendencia: STATUS.FINALIZADA_COM_PENDENCIA,
  validada_pelo_admin: STATUS.VALIDADA_PELO_ADMIN,
  concluido: STATUS.VALIDADA_PELO_ADMIN,
  concluida: STATUS.VALIDADA_PELO_ADMIN,
  finalizado: STATUS.VALIDADA_PELO_ADMIN,
  finalizada: STATUS.VALIDADA_PELO_ADMIN,
  fechado: STATUS.VALIDADA_PELO_ADMIN,
  fechada: STATUS.VALIDADA_PELO_ADMIN,
  cancelado: STATUS.CANCELADA,
  cancelada: STATUS.CANCELADA,
};

export const STATUS_OPTIONS = [
  STATUS.ABERTA,
  STATUS.EM_ATENDIMENTO,
  STATUS.PAUSADA,
  STATUS.FINALIZADA_PELO_TECNICO,
  STATUS.FINALIZADA_COM_PENDENCIA,
  STATUS.VALIDADA_PELO_ADMIN,
  STATUS.CANCELADA,
];

export function normalizeStatus(status?: string | null) {
  if (!status) return STATUS.ABERTA;
  const raw = String(status).trim();
  const lowered = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-\s]+/g, "_");
  return LEGACY_TO_CURRENT[lowered] || raw;
}

export function statusLabel(rawStatus?: string | null) {
  const status = normalizeStatus(rawStatus);

  if (status === STATUS.ABERTA) return "Aberta";
  if (status === STATUS.EM_ATENDIMENTO) return "Em andamento";
  if (status === STATUS.PAUSADA) return "Pausada";
  if (status === STATUS.FINALIZADA_PELO_TECNICO) return "Aguardando validação";
  if (status === STATUS.FINALIZADA_COM_PENDENCIA) return "Finalizada com pendência";
  if (status === STATUS.VALIDADA_PELO_ADMIN) return "Finalizada";
  if (status === STATUS.CANCELADA) return "Cancelada";
  return status;
}

export function statusBadgeClass(rawStatus?: string | null) {
  const status = normalizeStatus(rawStatus);

  if (status === STATUS.ABERTA) return "bg-amber-100 text-amber-700 border border-amber-200";
  if (status === STATUS.EM_ATENDIMENTO) return "bg-sky-100 text-sky-700 border border-sky-200";
  if (status === STATUS.PAUSADA) return "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-200";
  if (status === STATUS.FINALIZADA_PELO_TECNICO) return "bg-amber-100 text-amber-800 border border-amber-200";
  if (status === STATUS.FINALIZADA_COM_PENDENCIA) return "bg-orange-100 text-orange-800 border border-orange-200";
  if (status === STATUS.VALIDADA_PELO_ADMIN) return "bg-green-100 text-green-800 border border-green-200";
  if (status === STATUS.CANCELADA) return "bg-rose-100 text-rose-700 border border-rose-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export function isOpenStatus(rawStatus?: string | null) {
  const status = normalizeStatus(rawStatus);
  const openStatuses: string[] = [STATUS.ABERTA, STATUS.EM_ATENDIMENTO, STATUS.PAUSADA];
  return openStatuses.includes(status);
}

const STALE_STATUS_THRESHOLD_MS = 10 * 60 * 60 * 1000;

type StatusAgeInput = {
  status?: string | null;
  data_abertura?: string | null;
  data_inicio_atendimento?: string | null;
  data_retomada_atendimento?: string | null;
  data_pausa_atendimento?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

function parseDateMs(date?: string | null) {
  if (!date) return null;
  const time = new Date(date).getTime();
  return Number.isNaN(time) ? null : time;
}

function firstValidDate(...dates: Array<string | null | undefined>) {
  for (const date of dates) {
    const time = parseDateMs(date);
    if (time !== null) return { date, time };
  }

  return null;
}

export function getStatusAgeWarning(os: StatusAgeInput, nowMs = Date.now()) {
  const status = normalizeStatus(os.status);
  let since = null as ReturnType<typeof firstValidDate>;

  if (status === STATUS.ABERTA) {
    since = firstValidDate(os.data_abertura, os.createdAt);
  } else if (status === STATUS.EM_ATENDIMENTO) {
    since = firstValidDate(
      os.data_retomada_atendimento,
      os.data_inicio_atendimento,
      os.updatedAt,
      os.data_abertura,
      os.createdAt
    );
  } else if (status === STATUS.PAUSADA) {
    since = firstValidDate(os.data_pausa_atendimento, os.updatedAt, os.data_abertura, os.createdAt);
  } else {
    return null;
  }

  if (!since) return null;

  const elapsedMs = nowMs - since.time;
  if (elapsedMs < STALE_STATUS_THRESHOLD_MS) return null;

  return {
    since: since.date || null,
    hours: Math.floor(elapsedMs / (60 * 60 * 1000)),
    statusLabel: statusLabel(status),
  };
}

export function formatDate(date?: string | null) {
  if (!date) return "-";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export const TIPO_MANUTENCAO = ["CORRETIVA", "PREVENTIVA", "VISTORIA"] as const;
export const MOTIVOS_NAO_ASSINOU = ["AUSENTE", "FERIAS", "NAO_QUIS_ASSINAR", "OUTROS"] as const;
export const PRIORIDADES = ["BAIXA", "MEDIA", "ALTA", "URGENTE"] as const;
export const REPORT_CHANNELS = ["WHATSAPP", "EMAIL", "BOTH"] as const;

export function priorityLabel(rawPriority?: string | null) {
  const priority = String(rawPriority || "MEDIA").trim().toUpperCase();
  if (priority === "URGENTE") return "Urgente";
  if (priority === "ALTA") return "Alta";
  if (priority === "MEDIA") return "Media";
  if (priority === "BAIXA") return "Leve";
  return priority;
}

export function priorityBadgeClass(rawPriority?: string | null) {
  const priority = String(rawPriority || "MEDIA").trim().toUpperCase();
  if (priority === "URGENTE") return "bg-red-100 text-red-700 border border-red-200";
  if (priority === "ALTA") return "bg-amber-100 text-amber-800 border border-amber-200";
  if (priority === "MEDIA") return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  if (priority === "BAIXA") return "bg-lime-100 text-lime-700 border border-lime-200";
  return "bg-slate-100 text-slate-700 border border-slate-200";
}

export function formatDuration(totalSeconds?: number | null) {
  const seconds = Math.max(0, Number(totalSeconds || 0));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
