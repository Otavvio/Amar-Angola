# Auditoria técnica pré-lançamento

Data de referência: 25/11/2026. Escopo: ambiente Preview protegido, branch `seguranca-lancamento`. Este registro não constitui certificação de segurança nem autorização de lançamento.

## Evidências e resultados

| Controle | Resultado | Evidência |
|---|---|---|
| Build e sintaxe | Aprovado | npm ci, npm run check e npm run build executados pelo responsável; dist com quatro arquivos institucionais |
| Dependências | Aprovado na data do teste | npm audit reportou zero vulnerabilidades |
| Preview protegido | Aprovado | acesso anônimo redirecionado para autenticação Vercel |
| Interface | Aprovado | responsável confirmou página, estilos, menu, seções e privacidade |
| API pública | Aprovado | GET stats 200; sessão anônima 200 com logado false |
| Galeria | Desabilitada | GET gallery 503 esperado |
| Controle de acesso | Aprovado | PATCH stats sem sessão 401 |
| Rate limit | Aprovado | cinco requisições inválidas 400, sexta 429 |
| Cabeçalhos | Parcial | presença de CSP, HSTS, DENY, nosniff, referrer-policy e permissions-policy observada; CSP integral e comportamento não testados exaustivamente |
| Banco | Aprovado no escopo consultado | RLS nas cinco tabelas, acesso direto anon/authenticated restrito, bucket privado; função de incremento restrita; execução do gatilho RLS revogada para papéis públicos |
| Login | Aprovado | senha incorreta 401, correta 200; hash bcrypt custo 12 validado pelo responsável |
| Persistência | Aprovado | sessão logado true após atualização |
| Logout | Aprovado | 200, sessão false, PATCH 401; revogação e auditoria confirmadas no banco |
| Limpeza das sessões de teste | Aprovado | uma revogação preventiva auditada; consulta posterior: zero sessões ativas, duas revogadas, um administrador |
| Cookies | Pendente de teste no navegador | código define HttpOnly, Secure em produção, SameSite Strict, path /, duração 8h e JWT HS256 com validação da sessão no banco |

## Pendências e limites

- Confirmar atributos efetivos do cookie no navegador, sem compartilhar token; encerrar a sessão de teste depois.
- Registrar a migração de restrição do gatilho RLS no repositório, após conferir histórico do banco.
- Não há interface administrativa publicada neste build; testes administrativos foram realizados pelas APIs.
- Testes completos de abuso, acessibilidade, recuperação de falhas e compatibilidade não foram realizados; galeria desativada não equivale a galeria funcional validada.
- Revisar documentação jurídica, autorizações de imagem, titularidade Pix, prestação de contas e contato institucional antes de habilitar funcionalidades correspondentes.
- Manter galeria e doações desabilitadas enquanto as respectivas pendências persistirem. Domínio próprio adiado. Não promover Preview nem integrar main sem aprovação explícita.

## Decisão

Ambiente de testes funcional no escopo verificado. Lançamento oficial não aprovado. Nenhuma credencial, token ou dado pessoal de beneficiários deve ser incluído neste documento.
