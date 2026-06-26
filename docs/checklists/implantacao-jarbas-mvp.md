# Checklist de Implantacao - Jarbas Carga PN MVP

## Prioridade de Retomada

- [x] Em 2026-06-26, retomar pela Task 3 do plano: Supabase clients, middleware de autenticacao e login real.
- [x] Confirmar que a branch local ativa e `dev`.
- [x] Revisar `memory/history/2026-06-25-checkpoint-retomada-jarbas-mvp.md` antes de codar.

## Supabase

- [x] Confirmar se `supabase/migrations/202606250001_jarbas_mvp.sql` ja foi aplicada em algum Supabase real.
- [x] Se ainda nao foi aplicada, usar a versao atual da migration.
- [ ] Se uma versao anterior ja foi aplicada, criar migration incremental com:
  - function `public.validate_jarbas_execution_access`;
  - trigger `validate_jarbas_execution_access_trigger`;
  - policies RLS minimas;
  - ajustes de seed convergente.
- [ ] Validar SQL com `supabase` CLI ou `psql` antes de promover para `hom`.
- [x] Aplicar `supabase/seed/202606250001_jarbas_mvp_seed.sql`.
- [ ] Criar bucket `jarbas-uploads`.
- [ ] Criar usuario real de teste com e-mail/senha.
- [ ] Criar `profiles` para o usuario.
- [ ] Vincular usuario ao grupo `solucoes`.

## Auth e Login Real

- [x] Configurar `NEXT_PUBLIC_SUPABASE_URL`.
- [x] Configurar `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [x] Implementar clients Supabase em `lib/supabase/`.
- [x] Implementar middleware de sessao.
- [x] Implementar tela de login real baseada nos prototipos como referencia.
- [x] Garantir que Jarbas leia `profile.display_name` e nao assuma nome.

## Promocao GitHub

- [x] Desenvolvimento continua em `dev`.
- [ ] Promover `dev -> hom` somente depois de testes locais e checklist Supabase.
- [ ] Se `hom` reprovar, corrigir em `dev` e promover novamente.
- [ ] Promover `hom/main` somente apos validacao funcional.

## Validacoes Minimas Antes de Hom

- [x] `npm test`
- [x] `npm run lint`
- [x] `npm run build`
- [ ] Login real validado.
- [ ] Usuario de teste enxerga apenas agentes do grupo permitido.
- [ ] Nenhum segredo exposto no frontend.
