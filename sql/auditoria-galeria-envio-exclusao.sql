BEGIN;
CREATE FUNCTION public.registrar_galeria_auditada(p_caminho text,p_admin uuid,p_autorizacao boolean) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE i uuid;
BEGIN
IF p_autorizacao IS DISTINCT FROM true OR p_caminho IS NULL OR p_caminho !~ '^[0-9a-f-]{36}\.webp$' THEN RAISE EXCEPTION 'Dados invalidos' USING ERRCODE='22023'; END IF;
INSERT INTO public.gallery_items(url,storage_path,tipo,nome) VALUES(p_caminho,p_caminho,'image','Foto do projeto') RETURNING id INTO i;
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(p_admin,'enviar_privado','galeria',i::text,jsonb_build_object('autorizacao_armazenamento_confirmada',true));
RETURN i;
END; $$;
CREATE FUNCTION public.excluir_galeria_auditada(p_id uuid,p_admin uuid) RETURNS text LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE caminho text;
BEGIN
DELETE FROM public.gallery_items WHERE id=p_id RETURNING storage_path INTO caminho;
IF NOT FOUND THEN RETURN NULL; END IF;
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(p_admin,'excluir','galeria',p_id::text,jsonb_build_object('storage_path',caminho));
RETURN caminho;
END; $$;
REVOKE ALL ON FUNCTION public.registrar_galeria_auditada(text,uuid,boolean),public.excluir_galeria_auditada(uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.registrar_galeria_auditada(text,uuid,boolean),public.excluir_galeria_auditada(uuid,uuid) TO service_role;
COMMIT;