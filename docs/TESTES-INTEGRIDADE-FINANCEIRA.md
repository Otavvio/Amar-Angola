# Testes de integridade financeira

Testes SQL executados com SET LOCAL ROLE service_role em transação revertida com ROLLBACK.

Resultados aprovados: saldo inicial 550 (doação 500, contribuição 200, despesa 150); quatro auditorias de criação; rejeição de ID duplicado; rejeição de encerramento anterior a contribuição existente; encerramento válido na data da contribuição; rejeição de contribuição posterior; cancelamento válido; rejeição de cancelamento repetido; saldo após cancelamento 350; duas auditorias de encerramento/cancelamento.

Consulta posterior: zero movimentações, zero apadrinhamentos e zero auditorias com motivo TESTE.

Limites: testes SQL, não testes HTTP ou navegador. Não foi induzida falha de auditoria para testar atomicidade; não foram testadas operações concorrentes, relatórios semestrais completos, compilação ou interface. Publicação oficial não autorizada.
