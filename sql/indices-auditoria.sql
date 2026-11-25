BEGIN;
CREATE INDEX IF NOT EXISTS apadrinhamentos_created_by_idx ON public.apadrinhamentos(created_by);
CREATE INDEX IF NOT EXISTS audit_logs_admin_id_idx ON public.audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS gallery_items_autorizacao_por_idx ON public.gallery_items(autorizacao_verificada_por);
CREATE INDEX IF NOT EXISTS movimentacoes_created_by_idx ON public.movimentacoes(created_by);
COMMIT;