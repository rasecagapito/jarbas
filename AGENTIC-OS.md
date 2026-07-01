# Agentic OS - Jarbas / S.A.M.

## Plataforma
- **Versao Agentic OS**: 1.2.0 (camada Multi-Provedor ativa)
- **Cerebro canonico**: `AGENTS.md` (partilhado por todas as IAs)
- **IAs**: Codex (le `AGENTS.md` nativo) + Claude Code (`CLAUDE.md` -> `@AGENTS.md`) + Gemini (`GEMINI.md` -> `@AGENTS.md`)
- **Status**: parametrizacao inicial 2026-06-25; Multi-Provedor adicionado 2026-06-30

## Estrutura
| Peca | Status |
| --- | --- |
| Identidade (cerebro canonico) | `AGENTS.md` |
| Ponteiros de provedor | `CLAUDE.md`, `GEMINI.md` -> `@AGENTS.md` |
| `context/` | produto, arquitetura, stack, estrutura documental, github-flow |
| `memory/` | historico + licoes + `handoff.md` (estado vivo) |
| `workers/` | arquiteto multiagente, frontend cockpit, governanca Agentic OS |
| `automation/` | evaluation + guardrails + `procedures/` (propose, worker, wrapup, status, handoff) |
| `providers/` | `registry.md` - como cada IA le o cerebro |
| `changes/` | workflow de mudancas estruturadas (`archive/`) |
| comandos | `.claude/commands/`: propose, worker, wrapup, status, handoff |

## Camada Multi-Provedor (1.2.0)
- **Fonte unica + ponteiros**: `AGENTS.md` canonico; `CLAUDE.md`/`GEMINI.md` importam-no. Zero duplicacao = zero drift.
- **Handoff** (`memory/handoff.md`): estado vivo que a proxima IA le para retomar. Cursor derivado da primeira `[ ]` em `tasks.md`; gravado ao fechar cada tarefa (a prova de crash).
- **Procedimentos provider-neutros** (`automation/procedures/`): fonte unica da logica; `.claude/commands/` sao wrappers finos. Codex/Gemini pedem em linguagem natural.
- **Registo de provedores** (`providers/registry.md`): ficheiro de entrada, suporte a import e limitacoes por IA.

## Ciclo de Uso (qualquer IA)
1. Abrir a IA na raiz do projeto (Codex le `AGENTS.md`; Claude/Gemini via ponteiro).
2. Ler `memory/handoff.md` (Protocolo de Arranque no topo de `AGENTS.md`).
3. Retomar na mudanca ativa (`changes/<nome>/tasks.md`, primeira `[ ]`) ou no historico mais recente.
4. Ativar workers apenas quando ajudarem na tarefa.
5. `/wrapup` ao final; gravar handoff ao fechar cada tarefa.

## Arquivos Fonte Nao Alterados
- `1.documentacao/levantamento/textos/1-Documento de levantamento.md`
- Assets, telas HTML, imagens e videos em `1.documentacao/levantamento/`
