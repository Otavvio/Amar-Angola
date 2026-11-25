BEGIN;
CREATE TABLE public.apadrinhamentos (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), referencia text NOT NULL CHECK(char_length(referencia) BETWEEN 1 AND 120), inicio date NOT NULL DEFAULT CURRENT_DATE, encerramento date CHECK(encerramento >= inicio), created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL REFERENCES public.admins(id));
CREATE TABLE public.movimentacoes (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tipo text NOT NULL CHECK(tipo IN ('doacao','apadrinhamento','despesa')), valor numeric(12,2) NOT NULL CHECK(valor > 0), data date NOT NULL, descricao text NOT NULL CHECK(char_length(descricao) BETWEEN 1 AND 300), apadrinhamento_id uuid REFERENCES public.apadrinhamentos(id), created_at timestamptz NOT NULL DEFAULT now(), created_by uuid NOT NULL REFERENCES public.admins(id), CHECK((tipo='apadrinhamento')=(apadrinhamento_id IS NOT NULL)));
CREATE INDEX movimentacoes_data_idx ON public.movimentacoes(data);
CREATE INDEX movimentacoes_apadrinhamento_idx ON public.movimentacoes(apadrinhamento_id);
ALTER TABLE public.apadrinhamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.apadrinhamentos,public.movimentacoes FROM PUBLIC,anon,authenticated,service_role;
GRANT SELECT,INSERT ON public.movimentacoes TO service_role;
GRANT SELECT,INSERT,UPDATE ON public.apadrinhamentos TO service_role;
COMMIT;
-- Executar uma única vez em instalações que ainda não possuem estas tabelas.
