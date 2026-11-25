BEGIN;
CREATE FUNCTION public.auditar_novo_registro_financeiro() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
IF TG_TABLE_NAME='movimentacoes' THEN
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(NEW.created_by,'criar','movimentacao',NEW.id::text,jsonb_build_object('tipo',NEW.tipo));
ELSIF TG_TABLE_NAME='apadrinhamentos' THEN
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(NEW.created_by,'criar','apadrinhamento',NEW.id::text,'{}'::jsonb);
ELSE RAISE EXCEPTION 'Tabela inesperada';
END IF;
RETURN NEW;
END; $$;
REVOKE ALL ON FUNCTION public.auditar_novo_registro_financeiro() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.auditar_novo_registro_financeiro() TO service_role;
CREATE TRIGGER auditar_criacao_movimentacao AFTER INSERT ON public.movimentacoes FOR EACH ROW EXECUTE FUNCTION public.auditar_novo_registro_financeiro();
CREATE TRIGGER auditar_criacao_apadrinhamento AFTER INSERT ON public.apadrinhamentos FOR EACH ROW EXECUTE FUNCTION public.auditar_novo_registro_financeiro();
COMMIT;