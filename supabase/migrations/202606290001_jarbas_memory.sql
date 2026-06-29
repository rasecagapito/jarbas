create table if not exists public.jarbas_memories (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('user', 'group')),
  user_id uuid references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  source text not null default 'manual' check (source in ('manual', 'wrapup', 'status', 'system')),
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jarbas_memories_scope_target_check check (
    (scope = 'user' and user_id is not null and group_id is null)
    or
    (scope = 'group' and user_id is null and group_id is not null)
  )
);

create table if not exists public.jarbas_learnings (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('user', 'group')),
  user_id uuid references auth.users(id) on delete cascade,
  group_id uuid references public.groups(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  lesson text not null,
  evidence text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jarbas_learnings_scope_target_check check (
    (scope = 'user' and user_id is not null and group_id is null)
    or
    (scope = 'group' and user_id is null and group_id is not null)
  )
);

create index if not exists jarbas_memories_user_id_created_at_idx
  on public.jarbas_memories (user_id, created_at);

create index if not exists jarbas_memories_group_id_created_at_idx
  on public.jarbas_memories (group_id, created_at);

create index if not exists jarbas_memories_created_by_idx
  on public.jarbas_memories (created_by);

create index if not exists jarbas_learnings_user_id_created_at_idx
  on public.jarbas_learnings (user_id, created_at);

create index if not exists jarbas_learnings_group_id_created_at_idx
  on public.jarbas_learnings (group_id, created_at);

create index if not exists jarbas_learnings_created_by_idx
  on public.jarbas_learnings (created_by);

alter table public.jarbas_memories enable row level security;
alter table public.jarbas_learnings enable row level security;

create policy jarbas_memories_select_scoped on public.jarbas_memories
  for select to authenticated
  using (
    (scope = 'user' and user_id = (select auth.uid()))
    or
    (
      scope = 'group'
      and exists (
        select 1
        from public.user_groups ug
        where ug.user_id = (select auth.uid())
          and ug.group_id = jarbas_memories.group_id
      )
    )
  );

create policy jarbas_memories_insert_scoped on public.jarbas_memories
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (scope = 'user' and user_id = (select auth.uid()) and group_id is null)
      or
      (
        scope = 'group'
        and user_id is null
        and exists (
          select 1
          from public.user_groups ug
          where ug.user_id = (select auth.uid())
            and ug.group_id = jarbas_memories.group_id
        )
      )
    )
  );

create policy jarbas_memories_update_own_created on public.jarbas_memories
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));

create policy jarbas_learnings_select_scoped on public.jarbas_learnings
  for select to authenticated
  using (
    (scope = 'user' and user_id = (select auth.uid()))
    or
    (
      scope = 'group'
      and exists (
        select 1
        from public.user_groups ug
        where ug.user_id = (select auth.uid())
          and ug.group_id = jarbas_learnings.group_id
      )
    )
  );

create policy jarbas_learnings_insert_scoped on public.jarbas_learnings
  for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and (
      (scope = 'user' and user_id = (select auth.uid()) and group_id is null)
      or
      (
        scope = 'group'
        and user_id is null
        and exists (
          select 1
          from public.user_groups ug
          where ug.user_id = (select auth.uid())
            and ug.group_id = jarbas_learnings.group_id
        )
      )
    )
  );

create policy jarbas_learnings_update_own_created on public.jarbas_learnings
  for update to authenticated
  using (created_by = (select auth.uid()))
  with check (created_by = (select auth.uid()));
