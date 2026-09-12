-- Rode isto no SQL Editor do Supabase (Project > SQL Editor > New query)

create extension if not exists pgcrypto;

-- Administradores do painel
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Estatísticas exibidas no site (linha única, id sempre = 1)
create table if not exists stats (
  id smallint primary key default 1,
  visitas integer not null default 0,
  doacoes numeric(12,2) not null default 0,
  padrinhos integer not null default 0,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);
insert into stats (id) values (1) on conflict (id) do nothing;

-- Incrementa o contador de visitas de forma atômica (evita race condition
-- de dois pedidos simultâneos lendo o mesmo valor antes de gravar).
create or replace function incrementar_visitas()
returns integer
language sql
as $$
  update stats set visitas = visitas + 1, updated_at = now() where id = 1
  returning visitas;
$$;

-- Fotos/vídeos da galeria enviados pelo admin
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  storage_path text not null,
  tipo text not null check (tipo in ('image')),
  nome text,
  created_at timestamptz not null default now()
);

-- Observação: como o acesso ao banco é feito só pelas funções serverless
-- (com a service_role key, nunca exposta ao navegador), não é obrigatório
-- configurar Row Level Security aqui. Se um dia o front passar a falar
-- direto com o Supabase (sem passar pelas funções), habilite RLS nas três
-- tabelas e crie políticas específicas antes disso.

-- Depois de criar as tabelas, crie manualmente o primeiro admin, por exemplo
-- rodando localmente: node scripts/criar-admin.js (veja README-BACKEND.md)
