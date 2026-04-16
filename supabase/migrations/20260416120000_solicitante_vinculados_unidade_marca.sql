-- Colunas usadas pelo app para filtrar/listar solicitantes (ex.: DASA por unidade/marca)
alter table public.solicitante_vinculados
  add column if not exists unidade text,
  add column if not exists marca text;
