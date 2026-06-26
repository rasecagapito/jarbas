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
- `context/github-flow.md` - estrategia de branches GitHub: dev, hom e main.

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
8. Implementacoes devem acontecer na branch `dev`; `hom` e para homologacao, `main` e producao.
9. Tratar `env/` e arquivos `.env*` como segredos locais: nao versionar, nao imprimir valores e nao expor em commits ou logs.

## Comandos
| Comando | Acao |
| --- | --- |
| `/wrapup` | Consolidar a sessao em memoria |
| `/status` | Mostrar estado atual e proximos passos |
| `/worker [nome]` | Ativar um worker especialista |
| `/loop [objetivo]` | Executar em ciclos ate concluir exatamente o objetivo definido pelo usuario, gerar `/status` apos cada ciclo, parar ao atingir o ponto combinado e retornar ao usuario; carregar `commands/loop.md` quando existir |

## Estado do Projeto
- **Data da parametrizacao inicial**: 2026-06-25
- **Ultima sessao registrada**: `memory/history/2026-06-25-20-32-session.md`
- **Fluxo GitHub**: `dev -> hom -> main`
- **Status MVP**: Tasks 1 e 2 concluidas em `dev`; Task 3 e a proxima prioridade.
- **Proximo passo sugerido**: em 2026-06-26, retomar pela Task 3 do plano Jarbas Carga PN MVP: Supabase clients, middleware de auth e login real.
- **Checklist de implantacao**: `docs/checklists/implantacao-jarbas-mvp.md`
