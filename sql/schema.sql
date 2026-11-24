BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS public.admins (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), username text UNIQUE NOT NULL, password_hash text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.admin_sessions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), admin_id uuid NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE, created_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz NOT NULL, revoked_at timestamptz);
CREATE TABLE IF NOT EXISTS public.stats (id smallint PRIMARY KEY DEFAULT 1 CHECK(id=1), visitas integer NOT NULL DEFAULT 0 CHECK(visitas>=0), doacoes numeric(12,2) NOT NULL DEFAULT 0 CHECK(doacoes>=0), padrinhos integer NOT NULL DEFAULT 0 CHECK(padrinhos>=0), updated_at timestamptz NOT NULL DEFAULT now());
INSERT INTO public.stats(id) VALUES(1) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.gallery_items (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), url text NOT NULL, storage_path text UNIQUE NOT NULL, tipo text NOT NULL CHECK(tipo='image'), nome text, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.audit_logs (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), admin_id uuid REFERENCES public.admins(id) ON DELETE SET NULL, acao text NOT NULL, recurso text, recurso_id text, detalhes jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX IF NOT EXISTS idx_sessions_admin ON public.admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON public.admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_gallery_created ON public.gallery_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admins,public.admin_sessions,public.stats,public.gallery_items,public.audit_logs FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT,UPDATE,DELETE ON TABLE public.admins,public.admin_sessions,public.stats,public.gallery_items TO service_role;
GRANT SELECT,INSERT ON TABLE public.audit_logs TO service_role;
CREATE OR REPLACE FUNCTION public.incrementar_visitas() RETURNS integer LANGUAGE sql SECURITY INVOKER SET search_path='' AS $$ UPDATE public.stats SET visitas=visitas+1,updated_at=now() WHERE id=1 RETURNING visitas; $$;
REVOKE ALL ON FUNCTION public.incrementar_visitas() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.incrementar_visitas() TO service_role;
COMMIT;
-- Para instalações novas. CREATE TABLE IF NOT EXISTS não migra restrições de tabelas antigas.
-- Criar bucket privado galeria (2 MiB; JPEG, PNG, WebP) no painel, sem políticas públicas.
