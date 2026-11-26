# Amar Angola — Backup e recuperação
## Política proposta (pendente de aprovação)
Backup diário e antes de alterações estruturais; retenção inicial de 30 dias, sujeita à política de privacidade. Meta de perda máxima de 24 horas e recuperação em 4 horas, ainda não comprovadas.
## Inventário
- GitHub: código, SQL e documentação; manter histórico e branch protegida.
- Supabase PostgreSQL: admins, admin_sessions, apadrinhamentos, audit_logs, gallery_items, movimentacoes, relatorios_semestrais, stats; incluir funções, triggers, permissões e RLS.
- Storage: copiar os objetos privados da galeria separadamente do banco. Metadados SQL não substituem os arquivos.
- Vercel: registrar deployment READY e nomes/escopos das variáveis, nunca seus valores no Git.
- Upstash: limites temporários podem ser reconstruídos; não são fonte financeira.
## Rotina
1. Conferir plano e disponibilidade de backups em https://supabase.com/dashboard/project/wkvdbtwswnvcakvuvvwg/database/backups.
2. Usar backup gerenciado quando disponível; para cópia independente, usar cliente PostgreSQL compatível com a versão do servidor e conexão segura obtida no painel. Exportar schema public e dados com pg_dump em formato customizado, sem registrar senha no comando ou no histórico. Validar arquivo com pg_restore --list. Verificar dependências e extensões antes de restaurar.
3. Exportar objetos privados por cliente Storage autenticado, preservando caminhos e verificando hashes. Suspender mutações durante a captura coordenada de banco e objetos.
4. Guardar cópias criptografadas fora do repositório e do projeto original, com acesso restrito. Não enviar por WhatsApp, e-mail aberto ou chat. Registrar data UTC, versão do código, contagem de registros e objetos, checksum e resultado.
5. Verificar diariamente a execução e remover cópias vencidas conforme política aprovada.
## Recuperação
- Incidente: bloquear mutações e galeria pública; preservar evidências e registrar horário.
- Falha de código: selecionar deployment READY anterior compatível com o schema. Não promover sem autorização.
- Perda de dados: restaurar primeiro em ambiente isolado, sem acesso público; recuperar schema, dados e objetos; validar referências, totais, auditoria, permissões e RLS.
- Revogar sessões restauradas e rotacionar credenciais quando houver suspeita de comprometimento. Não reativar fotografias com autorizações revogadas.
- Comparar contagens e saldos com manifesto; validar login, relatórios e imagens sintéticas. Só migrar tráfego após aprovação.
## Homologação
Backup real, verificação de integridade e restauração isolada ainda pendentes. Não restaurar sobre a base ativa para testar. Confirmar custos antes de criar ambiente adicional.
