# Continuidade da Conversa - Jarbas Carga PN MVP

## Objetivo

Retomar o desenvolvimento do MVP Jarbas Carga PN sem perder o ponto atual. O usuario pediu para parar em 2026-06-25 e deixar tudo pronto para iniciar em 2026-06-26 seguindo o cronograma.

## Estado Atual

- Branch local ativa: `dev`.
- Fluxo GitHub oficial: `dev -> hom -> main`.
- Task 1 concluida: foundation Next.js, TypeScript, Tailwind e Vitest.
- Task 2 concluida: schema Supabase, grupos, agentes, permissoes, status, historico, checklists, uploaded files, AI providers e RLS basico.
- Proxima prioridade: Task 3, Supabase clients, auth middleware e login real.

## Commits Relevantes

- `c8e9d1e` - `chore: scaffold Jarbas MVP app`
- `e30cd29` - `fix: add Jarbas initial page`
- `f3faf50` - `feat: define Jarbas Supabase data model`
- `10d378d` - `fix: enforce Jarbas execution data rules`

## Decisoes Tomadas

- O desenvolvimento continua sempre em `dev`.
- `hom` e somente para homologacao.
- `main` representa producao.
- O primeiro grupo operacional e `Solucoes`.
- O modelo ja suporta `Consultoria` e `Administrativo`.
- O primeiro agente e `Carga PN Excel`.
- Jarbas orquestra; n8n executa a carga.
- O workflow alvo e `AfhcrI8P35wY0SV7`.
- O workflow referencia e `aeXRhoPa7qV4X55X`.
- O cerebro IA deve suportar multiplos provedores via AI Router, sem expor secrets no browser.

## Validacoes Realizadas

- `npm test`: passou.
- `npm run lint`: passou.
- `npm run build`: passou.
- Revisao independente aprovou Task 2 apos follow-up.

## Pendencias e Riscos

- Nao ha `supabase` CLI nem `psql` instalados neste ambiente, entao a migration ainda nao foi executada localmente contra Postgres.
- Se `supabase/migrations/202606250001_jarbas_mvp.sql` ja tiver sido aplicada em um Supabase real antes do commit `10d378d`, criar uma migration incremental para os ajustes de review.
- Antes das Tasks 5/7/8, avaliar restricao de updates de status/progresso para backend/service role/n8n.

## Proximos Passos

1. Confirmar `git status --short --branch` e garantir branch `dev`.
2. Ler `docs/checklists/implantacao-jarbas-mvp.md`.
3. Iniciar Task 3 do plano `docs/superpowers/plans/2026-06-25-jarbas-carga-pn-mvp.md`.
4. Implementar clients Supabase, middleware de auth e login real.
5. Validar com `npm test`, `npm run lint` e `npm run build`.

## Prompt de Retomada Sugerido

Retomar o projeto Jarbas Carga PN MVP em `C:\Dev\jarbas\.projeto1`. Estamos na branch `dev`. Tasks 1 e 2 foram concluidas e revisadas. Comecar pela Task 3 do plano `docs/superpowers/plans/2026-06-25-jarbas-carga-pn-mvp.md`, observando o checklist `docs/checklists/implantacao-jarbas-mvp.md`.
