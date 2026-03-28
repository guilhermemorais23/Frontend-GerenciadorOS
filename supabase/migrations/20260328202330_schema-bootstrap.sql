create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  nome text,
  email text,
  senha text,
  telefone text,
  cliente_vinculado text not null default '',
  subcliente_vinculado text not null default '',
  marca_vinculada text not null default '',
  unidade_vinculada text not null default '',
  role text not null default 'tecnico' check (role in ('admin', 'tecnico', 'terceiro', 'cliente')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists users_email_key on public.users (email) where email is not null;

create table if not exists public.clientes (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  cliente text not null,
  subcliente text,
  marca text,
  unidade text,
  endereco text,
  telefone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists clientes_cliente_idx on public.clientes (cliente);
create index if not exists clientes_subcliente_idx on public.clientes (subcliente);

create table if not exists public.counters (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  name text not null unique,
  seq integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  cliente text not null,
  subcliente text,
  endereco text,
  telefone text,
  marca text,
  unidade text,
  detalhamento text,
  os_numero text,
  status text not null default 'aguardando_tecnico' check (status in ('aguardando_tecnico', 'em_andamento', 'concluido', 'cancelado')),
  tecnico_id uuid references public.users(id) on delete set null,
  antes_relatorio text,
  antes_observacao text,
  antes_fotos jsonb not null default '[]'::jsonb,
  depois_relatorio text,
  depois_observacao text,
  depois_fotos jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_cliente_idx on public.projects (cliente);
create index if not exists projects_status_idx on public.projects (status);
create index if not exists projects_tecnico_id_idx on public.projects (tecnico_id);
create index if not exists projects_os_numero_idx on public.projects (os_numero);

create table if not exists public.unidades (
  id uuid primary key default gen_random_uuid(),
  mongo_id text unique,
  nome text not null,
  marca text not null,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists unidades_cliente_id_idx on public.unidades (cliente_id);
create index if not exists unidades_nome_idx on public.unidades (nome);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_users on public.users;
create trigger set_updated_at_users
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_clientes on public.clientes;
create trigger set_updated_at_clientes
before update on public.clientes
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_counters on public.counters;
create trigger set_updated_at_counters
before update on public.counters
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_projects on public.projects;
create trigger set_updated_at_projects
before update on public.projects
for each row
execute function public.set_updated_at();

drop trigger if exists set_updated_at_unidades on public.unidades;
create trigger set_updated_at_unidades
before update on public.unidades
for each row
execute function public.set_updated_at();
