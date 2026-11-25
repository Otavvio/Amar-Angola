BEGIN;
CREATE FUNCTION public.encerrar_apadrinhamento(p_id uuid,p_data date,p_motivo text,p_admin uuid) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_inicio date; v_fim date;
BEGIN
IF p_data IS NULL OR p_motivo IS NULL OR char_length(trim(p_motivo)) NOT BETWEEN 1 AND 300 THEN RETURN false; END IF;
SELECT inicio,encerramento INTO v_inicio,v_fim FROM public.apadrinhamentos WHERE id=p_id FOR UPDATE;
IF NOT FOUND OR v_fim IS NOT NULL OR p_data<v_inicio OR EXISTS(SELECT 1 FROM public.movimentacoes WHERE apadrinhamento_id=p_id AND data>p_data) THEN RETURN false; END IF;
UPDATE public.apadrinhamentos SET encerramento=p_data WHERE id=p_id;
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(p_admin,'encerrar','apadrinhamento',p_id::text,jsonb_build_object('data',p_data,'motivo',trim(p_motivo)));
RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.encerrar_apadrinhamento(uuid,date,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.encerrar_apadrinhamento(uuid,date,text,uuid) TO service_role;
CREATE FUNCTION public.validar_periodo_contribuicao() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE v_inicio date; v_fim date;
BEGIN
IF NEW.tipo='apadrinhamento' THEN
SELECT inicio,encerramento INTO v_inicio,v_fim FROM public.apadrinhamentos WHERE id=NEW.apadrinhamento_id FOR UPDATE;
IF NOT FOUND OR NEW.data<v_inicio OR (v_fim IS NOT NULL AND NEW.data>v_fim) THEN RAISE EXCEPTION 'Contribuicao fora do periodo' USING ERRCODE='23514'; END IF;
END IF;
RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.validar_periodo_contribuicao() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.validar_periodo_contribuicao() TO service_role;
CREATE TRIGGER validar_periodo_contribuicao BEFORE INSERT OR UPDATE ON public.movimentacoes FOR EACH ROW EXECUTE FUNCTION public.validar_periodo_contribuicao();
COMMIT;