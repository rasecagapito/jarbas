# Agent: Jarbas / S.A.M.
> Cerebro operacional do projeto para Codex. Mantenha este arquivo leve; carregue os modulos conforme a tarefa.

## Identidade
- **Projeto**: Jarbas / S.A.M. - Secure Automated Multi-Agent Platform
- **Plataforma de IA**: Codex
- **Fase**: levantamento e parametrizacao inicial
- **Fonte principal atual**: `1.documentacao/levantamento/textos/1-Documento de levantamento.md`

## Objetivo do Projeto
Construir um cockpit tatico multiagente com interface futurista, avatar/robo holografico em Three.js, entrada por texto e voz, orquestracao no n8n e persistencia/governanca de dados no Supabase.

## Modulos de Conhecimento
Carregar somente quando relevante:
- `context/produto.md` - produto, publico, objetivos e materiais existentes.
- `context/arquitetura.md` - arquitetura conceitual, camadas e fluxo multiagente.
- `context/stack.md` - tecnologias previstas, integracoes e comandos conhecidos.
- `context/estrutura-documental.md` - mapa de pastas e documentos do projeto.

## Workers Disponiveis
- **Arquiteto Multiagente** (`workers/arquiteto-multiagente.md`) - analisa arquitetura, n8n, Supabase, RAG e setores.
- **Frontend Cockpit** (`workers/frontend-cockpit.md`) - orienta telas, UX, Three.js, voz e cockpit visual.
- **Governanca Agentic OS** (`workers/governanca-agentic-os.md`) - mantem memoria, historico, licoes e guardrails.

## Regras Operacionais
1. Consultar `context/` antes de responder sobre produto, arquitetura, stack ou documentacao.
2. Consultar `memory/history/` ao retomar trabalho para entender o ultimo estado.
3. Consultar `memory/learnings/` antes de investigar problemas recorrentes ou decisoes ja tomadas.
4. Nao deletar, mover ou renomear arquivos sem aprovacao explicita do usuario.
5. Nao alterar codigo, configuracoes, dependencias, segredos ou arquivos operacionais quando a tarefa for de Agentic OS.
6. Registrar decisoes importantes e proximos passos em `memory/` ao encerrar sessoes relevantes.
7. Para consolidar mais de dois arquivos de contexto/cerebro, mapear antes e pedir aprovacao.

## Comandos
| Comando | Acao |
| --- | --- |
| `/wrapup` | Consolidar a sessao em memoria |
| `/status` | Mostrar estado atual e proximos passos |
| `/worker [nome]` | Ativar um worker especialista |

## Estado do Projeto
- **Data da parametrizacao inicial**: 2026-06-25
- **Ultima sessao registrada**: `memory/history/2026-06-25-parametrizacao-inicial.md`
- **Proximo passo sugerido**: validar com o usuario quais telas/fluxos devem virar implementacao primeiro.

