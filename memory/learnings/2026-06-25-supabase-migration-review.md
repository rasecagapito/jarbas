# Licao - Migration Supabase Depois de Review

## Contexto

Durante a Task 2 do MVP Jarbas Carga PN, a migration inicial foi criada e depois reforcada apos revisao independente.

## Aprendizado

Quando uma migration ainda nao foi aplicada em ambiente real, pode ser ajustada no arquivo original durante a fase local de desenvolvimento. Se ela ja foi aplicada em Supabase real, nao confiar em edicoes no arquivo original: criar uma migration incremental com o delta.

## Aplicacao no Jarbas

Antes de promover para `hom`, confirmar se `supabase/migrations/202606250001_jarbas_mvp.sql` ja foi aplicada em ambiente real.

Se ja foi aplicada antes do commit `10d378d`, criar migration incremental contendo:

- function `public.validate_jarbas_execution_access`;
- trigger `validate_jarbas_execution_access_trigger`;
- policies RLS minimas;
- ajustes de seed convergente quando aplicavel.

## Guardrail

Nao promover schema para `hom` sem validacao SQL real por Supabase CLI, `psql` ou ambiente Supabase controlado.
