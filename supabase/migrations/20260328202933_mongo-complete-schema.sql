alter table public.users
  add column if not exists version integer,
  add column if not exists raw_doc jsonb not null default '{}'::jsonb;

alter table public.clientes
  add column if not exists version integer,
  add column if not exists raw_doc jsonb not null default '{}'::jsonb;

alter table public.counters
  add column if not exists version integer,
  add column if not exists raw_doc jsonb not null default '{}'::jsonb;

alter table public.unidades
  add column if not exists cliente_mongo_id text,
  add column if not exists version integer,
  add column if not exists raw_doc jsonb not null default '{}'::jsonb;

alter table public.projects
  drop constraint if exists projects_status_check;

alter table public.projects
  add column if not exists mongo_tecnico_id text,
  add column if not exists subcliente_legacy text,
  add column if not exists email text,
  add column if not exists orcamento_previsto text,
  add column if not exists equipamento_nome text,
  add column if not exists equipamento_fabricante text,
  add column if not exists equipamento_modelo text,
  add column if not exists equipamento_numero_serie text,
  add column if not exists equipamento_patrimonio text,
  add column if not exists equipamento_especificacoes text,
  add column if not exists solicitante_nome text,
  add column if not exists tipo_manutencao text,
  add column if not exists prioridade text,
  add column if not exists cliente_nome text,
  add column if not exists cliente_funcao text,
  add column if not exists cliente_nao_assinou boolean,
  add column if not exists client_did_not_sign boolean,
  add column if not exists motivo_nao_assinou text,
  add column if not exists assinatura_cliente text,
  add column if not exists assinatura_tecnico text,
  add column if not exists foto_cliente text,
  add column if not exists materiais_solicitados jsonb not null default '[]'::jsonb,
  add column if not exists active_seconds integer,
  add column if not exists pause_seconds integer,
  add column if not exists pause_count integer,
  add column if not exists quantidade_pausas integer,
  add column if not exists tempo_total_ativo_segundos integer,
  add column if not exists deslocamento_segundos integer,
  add column if not exists deslocamento_concluido boolean,
  add column if not exists feedback_admin text,
  add column if not exists report_pdf_url text,
  add column if not exists report_pdf_generated_at timestamptz,
  add column if not exists data_abertura timestamptz,
  add column if not exists data_inicio_deslocamento timestamptz,
  add column if not exists data_fim_deslocamento timestamptz,
  add column if not exists data_inicio_atendimento timestamptz,
  add column if not exists data_pausa_atendimento timestamptz,
  add column if not exists data_retomada_atendimento timestamptz,
  add column if not exists data_finalizacao_tecnico timestamptz,
  add column if not exists data_validacao_admin timestamptz,
  add column if not exists version integer,
  add column if not exists raw_doc jsonb not null default '{}'::jsonb;

create table if not exists public.report_delivery_logs (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  os_mongo_id text,
  project_id uuid references public.projects(id) on delete set null,
  channel text,
  status text,
  delivery_email text,
  delivery_phone_e164 text,
  message text,
  provider_response jsonb not null default '{}'::jsonb,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  raw_doc jsonb not null default '{}'::jsonb
);

create index if not exists report_delivery_logs_project_id_idx on public.report_delivery_logs (project_id);
create index if not exists report_delivery_logs_os_mongo_id_idx on public.report_delivery_logs (os_mongo_id);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  type text,
  title text,
  message text,
  os_mongo_id text,
  project_id uuid references public.projects(id) on delete set null,
  read_at timestamptz,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  raw_doc jsonb not null default '{}'::jsonb
);

create index if not exists admin_notifications_project_id_idx on public.admin_notifications (project_id);

create table if not exists public.os_events (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  os_mongo_id text,
  project_id uuid references public.projects(id) on delete set null,
  actor_user_mongo_id text,
  actor_user_id uuid references public.users(id) on delete set null,
  old_status text,
  new_status text,
  note text,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  raw_doc jsonb not null default '{}'::jsonb
);

create index if not exists os_events_project_id_idx on public.os_events (project_id);
create index if not exists os_events_actor_user_id_idx on public.os_events (actor_user_id);

create table if not exists public.catalog_equipamentos (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  nome text,
  fabricante text,
  modelo text,
  estoque_qtd integer,
  foto_base64 text,
  numero_serie text,
  patrimonio text,
  especificacoes_tecnicas text,
  observacoes text,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  raw_doc jsonb not null default '{}'::jsonb
);

create table if not exists public.solicitante_vinculados (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  cliente_key text,
  subcliente_key text,
  nome_key text,
  cliente text,
  subcliente text,
  nome text,
  cargo text,
  email text,
  telefone text,
  version integer,
  created_at timestamptz,
  updated_at timestamptz,
  raw_doc jsonb not null default '{}'::jsonb
);

create table if not exists public.os_stock_items (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  raw_doc jsonb not null default '{}'::jsonb
);

create table if not exists public.equipment_catalogs (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  raw_doc jsonb not null default '{}'::jsonb
);
