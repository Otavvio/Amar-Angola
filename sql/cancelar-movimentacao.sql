BEGIN;
ALTER TABLE public.movimentacoes ADD COLUMN cancelado_em timestamptz, ADD COLUMN cancelado_por uuid REFERENCES public.admins(id), ADD COLUMN cancelamento_motivo text, ADD CONSTRAINT cancelamento_completo CHECK ((cancelado_em IS NULL AND cancelado_por IS NULL AND cancelamento_motivo IS NULL) OR (cancelado_em IS NOT NULL AND cancelado_por IS NOT NULL AND cancelamento_motivo IS NOT NULL AND char_length(trim(cancelamento_motivo)) BETWEEN 1 AND 300));
CREATE INDEX movimentacoes_cancelado_por_idx ON public.movimentacoes(cancelado_por);
GRANT UPDATE(cancelado_em,cancelado_por,cancelamento_motivo) ON public.movimentacoes TO service_role;
CREATE FUNCTION public.cancelar_movimentacao(p_id uuid,p_motivo text,p_admin uuid) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
IF p_motivo IS NULL OR char_length(trim(p_motivo)) NOT BETWEEN 1 AND 300 THEN RETURN false; END IF;
UPDATE public.movimentacoes SET cancelado_em=now(),cancelado_por=p_admin,cancelamento_motivo=trim(p_motivo) WHERE id=p_id AND cancelado_em IS NULL;
IF NOT FOUND THEN RETURN false; END IF;
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(p_admin,'cancelar','movimentacao',p_id::text,jsonb_build_object('motivo',trim(p_motivo)));
RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.cancelar_movimentacao(uuid,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.cancelar_movimentacao(uuid,text,uuid) TO service_role;
COMMIT;