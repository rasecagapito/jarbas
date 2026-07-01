# Mudança: conformidade-agentic-os-1.3.0

## Porquê
O plugin Agentic OS 1.3.0 introduziu uma **Conformance Spec** verificável (`docs/CONFORMANCE-SPEC.md`)
com regras anti-drift invioláveis. Auditoria (Agente A) do projeto deu **FAIL** por 2 divergências —
uma delas citada nominalmente na spec como erro real observado em `.projeto1`:

- **D1 (DRIFT)** — `commands/` na raiz duplicava a lógica já existente em
  `automation/procedures/` + `.claude/commands/`. Três fontes para a mesma lógica = drift garantido.
- **D4 (DRIFT)** — `automation/evaluation.json` declarava só `platform: "Codex"` num projeto
  tri-IA (Codex + Claude + Gemini), com gate `codex_session_start` provider-específico.

Descoberta adicional durante a auditoria: `dev` estava **atrás** de `hom` — toda a camada
multi-provider (procedures, providers, ponteiros, wrappers) fora commitada direto em `hom`,
violando o fluxo `dev -> hom`. Resolvido por merge `hom -> dev` antes do fix.

## Escopo

### Entra
- Sincronizar `dev` com `hom` (merge, traz a camada multi-provider para `dev`).
- Migrar a lógica de `/loop` para `automation/procedures/loop.md` (fonte única).
- Criar wrapper fino `.claude/commands/loop.md`.
- Remover a pasta `commands/` da raiz (4 ficheiros: loop, status, worker, wrapup).
- Atualizar referência de `/loop` em `AGENTS.md` para o procedure.
- Corrigir `automation/evaluation.json`: `platform: "Codex"` → `providers: [...]` + gate `session_start` neutro.

### NÃO entra
- Nenhuma alteração de código de aplicação (`app/`, `lib/`, `components/`, `tests/`, migrations).
- Nenhuma mudança de comportamento funcional do Jarbas.
- Promoção a `hom`/`main` (só com aprovação explícita, após validação).

## Abordagem
Fix estrutural puro (metodologia Agentic OS, não software). `git mv` preserva histórico do loop;
demais duplicados removidos com `git rm`. Uma só fonte por lógica de comando (regra D5).
Re-auditoria contra a Conformance Spec deve dar **PASS** antes de declarar sucesso.
