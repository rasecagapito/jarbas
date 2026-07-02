# Agent: Jarbas / S.A.M.
> Cerebro operacional do projeto para Codex. Mantenha este arquivo leve; carregue os modulos conforme a tarefa.

## Identidade
- **Projeto**: Jarbas / S.A.M. - Secure Automated Multi-Agent Platform
- **Plataforma de IA**: Codex
- **Fase**: levantamento e parametrizacao inicial
- **Fonte principal atual**: `1.documentacao/levantamento/textos/1-Documento de levantamento.md`

## Protocolo de Arranque de Sessao (LER PRIMEIRO - qualquer IA)
Antes de qualquer trabalho, sempre nesta ordem:
1. Ler `memory/handoff.md` - estado vivo: ultimo provedor, mudanca ativa, narrativa.
2. Se ha mudanca ativa em `changes/<nome>/`, abrir e ler `tasks.md`; retomar na primeira tarefa `[ ]` (o cursor). Nao recomecar do zero.
3. Se nao ha mudanca ativa, ler o historico mais recente em `memory/history/`.
4. Carregar so os modulos de `context/` relevantes a tarefa (poupar tokens).
Ao fechar cada tarefa e ao encerrar sessao: seguir `automation/procedures/handoff.md` e `wrapup.md`.

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
10. Nao subir ao GitHub nenhum arquivo de `memory/`; memoria, historico e aprendizados sao apenas locais por seguranca.
11. Nunca promover para PRD/producao/`main` sem aprovacao explicita do usuario apos validacao em `hom`.

## Comandos
| Comando | Acao |
| --- | --- |
| `/wrapup` | Consolidar a sessao em memoria |
| `/status` | Mostrar estado atual e proximos passos |
| `/worker [nome]` | Ativar um worker especialista |
| `/propose <nome>` | Criar mudanca estruturada em `changes/<nome>/` (proc.: `automation/procedures/propose.md`) |
| `/handoff` | Ler/gravar estado vivo em `memory/handoff.md` (proc.: `automation/procedures/handoff.md`) |
| `/loop [objetivo]` | Executar em ciclos ate concluir exatamente o objetivo definido pelo usuario, gerar `/status` apos cada ciclo, parar ao atingir o ponto combinado e retornar ao usuario (proc.: `automation/procedures/loop.md`) |

> Multi-provedor: este `AGENTS.md` e o cerebro canonico. `CLAUDE.md` e `GEMINI.md` sao ponteiros (`@AGENTS.md`) - nao duplicar conteudo. Como cada IA le o cerebro: `providers/registry.md`. Logica dos comandos (fonte unica, provider-neutra): `automation/procedures/`.

## Estado do Projeto
- **Data da parametrizacao inicial**: 2026-06-25
- **Ultima sessao registrada**: `memory/history/2026-06-30-20-51-session-hom-chat-escrito-voz-pausada.md`
- **Fluxo GitHub**: `dev -> hom -> main`
- **Status MVP**: Jarbas inteligente em HOM com conversacao escrita, resumo, portal/SAP e fluxos validados tecnicamente; voz pausada por decisao operacional.
- **Motor de IA**: OpenRouter (OpenAI-compativel, slug `openai` em `lib/ai/provider.ts`), cadeia de modelos `:free` com fallback. Sem mudanca de motor pendente (Hermes descartado 2026-07-02, arquivado em `changes/archive/trocar-motor-hermes/`). Gotcha: `:free` da 404/429 aleatorio; estabilizar futuramente com modelo pago/BYOK.
- **Proximo passo sugerido**: validar HOM por texto (`jarbas-hom.vercel.app`); depois planejar segunda etapa de voz com motor mais estavel; promover `main` somente com aprovacao explicita.
- **Checklist de implantacao**: `docs/checklists/implantacao-jarbas-mvp.md`
