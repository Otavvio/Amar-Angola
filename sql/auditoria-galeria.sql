BEGIN;
CREATE FUNCTION public.atualizar_galeria_auditada(p_id uuid,p_admin uuid,p_titulo text,p_descricao text,p_evento text,p_estado text,p_ref text,p_confirmada boolean) RETURNS boolean LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
IF p_estado NOT IN ('privada','oculta','aprovada') OR p_estado IS NULL OR (p_estado='aprovada' AND nullif(trim(p_ref),'') IS NULL) OR (nullif(trim(p_ref),'') IS NOT NULL AND p_confirmada IS DISTINCT FROM true) THEN RAISE EXCEPTION 'Autorizacao invalida' USING ERRCODE='22023'; END IF;
UPDATE public.gallery_items SET titulo=trim(p_titulo),descricao=trim(p_descricao),evento=trim(p_evento),estado=p_estado,autorizacao_ref=nullif(trim(p_ref),''),autorizacao_verificada_em=CASE WHEN nullif(trim(p_ref),'') IS NOT NULL THEN now() END,autorizacao_verificada_por=CASE WHEN nullif(trim(p_ref),'') IS NOT NULL THEN p_admin END WHERE id=p_id;
IF NOT FOUND THEN RETURN false; END IF;
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(p_admin,'atualizar','galeria',p_id::text,jsonb_build_object('estado',p_estado,'autorizacao_confirmada',p_confirmada IS TRUE));
RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.atualizar_galeria_auditada(uuid,uuid,text,text,text,text,text,boolean) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.atualizar_galeria_auditada(uuid,uuid,text,text,text,text,text,boolean) TO service_role;
COMMIT;