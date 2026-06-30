alter table public.conversation_history
  add column if not exists group_id uuid references public.groups(id) on delete set null;

create index if not exists conversation_history_group_id_created_at_idx
  on public.conversation_history (group_id, created_at);

drop policy if exists conversation_history_select_own on public.conversation_history;
create policy conversation_history_select_own on public.conversation_history
  for select to authenticated
  using (
    user_id = (select auth.uid())
    and (
      group_id is null
      or exists (
        select 1
        from public.user_groups ug
        where ug.user_id = (select auth.uid())
          and ug.group_id = conversation_history.group_id
      )
    )
  );

drop policy if exists conversation_history_insert_own on public.conversation_history;
create policy conversation_history_insert_own on public.conversation_history
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      group_id is null
      or exists (
        select 1
        from public.user_groups ug
        where ug.user_id = (select auth.uid())
          and ug.group_id = conversation_history.group_id
      )
    )
  );

drop policy if exists conversation_history_update_own on public.conversation_history;
create policy conversation_history_update_own on public.conversation_history
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (
      group_id is null
      or exists (
        select 1
        from public.user_groups ug
        where ug.user_id = (select auth.uid())
          and ug.group_id = conversation_history.group_id
      )
    )
  )
  with check (
    user_id = (select auth.uid())
    and (
      group_id is null
      or exists (
        select 1
        from public.user_groups ug
        where ug.user_id = (select auth.uid())
          and ug.group_id = conversation_history.group_id
      )
    )
  );
