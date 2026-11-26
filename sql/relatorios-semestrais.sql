BEGIN;
CREATE TABLE public.relatorios_semestrais(id uuid PRIMARY KEY DEFAULT gen_random_uuid(), ano integer NOT NULL CHECK(ano BETWEEN 2000 AND 9999), semestre integer NOT NULL CHECK(semestre IN(1,2)), versao integer NOT NULL CHECK(versao>0), motivo text NOT NULL CHECK(char_length(trim(motivo)) BETWEEN 1 AND 300), resumo jsonb NOT NULL, created_by uuid NOT NULL REFERENCES public.admins(id), created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(ano,semestre,versao));
CREATE INDEX relatorios_created_by_idx ON public.relatorios_semestrais(created_by);
ALTER TABLE public.relatorios_semestrais ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.relatorios_semestrais FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT ON public.relatorios_semestrais TO service_role;
CREATE FUNCTION public.consolidar_semestre(p_ano integer,p_semestre integer,p_motivo text,p_admin uuid) RETURNS uuid LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
DECLARE i date; f date; v integer; r uuid; j jsonb;
BEGIN
IF p_ano IS NULL OR p_ano NOT BETWEEN 2000 AND 9999 OR p_semestre IS NULL OR p_semestre NOT IN(1,2) OR p_motivo IS NULL OR char_length(trim(p_motivo)) NOT BETWEEN 1 AND 300 THEN RAISE EXCEPTION 'Dados invalidos' USING ERRCODE='22023'; END IF;
i:=make_date(p_ano,CASE WHEN p_semestre=1 THEN 1 ELSE 7 END,1);
f:=make_date(p_ano,CASE WHEN p_semestre=1 THEN 6 ELSE 12 END,CASE WHEN p_semestre=1 THEN 30 ELSE 31 END);
IF f >= (now() AT TIME ZONE 'America/Sao_Paulo')::date THEN RAISE EXCEPTION 'Semestre ainda aberto' USING ERRCODE='22023'; END IF;
PERFORM pg_advisory_xact_lock(31001,p_ano*2+p_semestre);
SELECT coalesce(max(versao),0)+1 INTO v FROM public.relatorios_semestrais WHERE ano=p_ano AND semestre=p_semestre;
WITH m AS (SELECT tipo,valor,data FROM public.movimentacoes WHERE data BETWEEN i AND f AND cancelado_em IS NULL), t AS (SELECT coalesce(sum(valor) FILTER(WHERE tipo='doacao'),0) d,coalesce(sum(valor) FILTER(WHERE tipo='apadrinhamento'),0) a,coalesce(sum(valor) FILTER(WHERE tipo='despesa'),0) e FROM m)
SELECT jsonb_build_object('inicio',i,'fim',f,'doacoes_centavos',(d*100)::bigint::text,'contribuicoes_centavos',(a*100)::bigint::text,'receitas_centavos',((d+a)*100)::bigint::text,'despesas_centavos',(e*100)::bigint::text,'saldo_periodo_centavos',((d+a-e)*100)::bigint::text,'apadrinhamentos_ativos',(SELECT count(*) FROM public.apadrinhamentos WHERE inicio<=f AND (encerramento IS NULL OR encerramento>=f)),'visitas_acumuladas',(SELECT visitas FROM public.stats WHERE id=1),'meses',(SELECT jsonb_agg(jsonb_build_object('mes',to_char(g.mes,'YYYY-MM'),'receitas_centavos',(coalesce((SELECT sum(valor) FROM m WHERE tipo<>'despesa' AND date_trunc('month',data)=g.mes),0)*100)::bigint::text,'despesas_centavos',(coalesce((SELECT sum(valor) FROM m WHERE tipo='despesa' AND date_trunc('month',data)=g.mes),0)*100)::bigint::text) ORDER BY g.mes) FROM generate_series(i::timestamp,f::timestamp,interval '1 month') g(mes))) INTO j FROM t;
INSERT INTO public.relatorios_semestrais(ano,semestre,versao,motivo,resumo,created_by) VALUES(p_ano,p_semestre,v,trim(p_motivo),j,p_admin) RETURNING id INTO r;
INSERT INTO public.audit_logs(admin_id,acao,recurso,recurso_id,detalhes) VALUES(p_admin,'consolidar','relatorio',r::text,jsonb_build_object('ano',p_ano,'semestre',p_semestre,'versao',v));
RETURN r;
END; $$;
REVOKE ALL ON FUNCTION public.consolidar_semestre(integer,integer,text,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.consolidar_semestre(integer,integer,text,uuid) TO service_role;
COMMIT;