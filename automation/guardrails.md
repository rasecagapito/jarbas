# Guardrails

## Acoes Que Exigem Confirmacao Humana
- Deletar qualquer arquivo.
- Mover ou renomear arquivos existentes.
- Alterar codigo fonte, configuracao de build, deploy, migracoes, segredos ou dependencias.
- Consolidar mais de dois arquivos de cerebro/contexto.
- Acessar APIs pagas, producao, banco real ou webhooks reais.
- Criar ou executar scripts que alterem dados externos.

## Acoes Documentais Permitidas
- Ler arquivos do projeto.
- Criar documentacao Agentic OS nova quando solicitada.
- Registrar historico em `memory/history/`.
- Registrar licoes em `memory/learnings/`.
- Adicionar referencias de docs Agentic OS para documentos existentes.

## Escalada
Quando houver duvida sobre risco, parar e pedir confirmacao.

