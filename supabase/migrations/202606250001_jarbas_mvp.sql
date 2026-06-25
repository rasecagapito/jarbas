create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text,
  email text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.user_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, group_id)
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.agent_permissions (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  can_execute boolean not null default false,
  created_at timestamptz not null default now(),
  unique (agent_id, group_id)
);

create table if not exists public.ai_providers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  base_url text,
  auth_mode text not null default 'api_key' check (auth_mode in ('api_key', 'bearer_token', 'oauth', 'gateway')),
  secret_ref text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ai_models (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.ai_providers(id) on delete cascade,
  model_key text not null,
  display_name text not null,
  supports_text boolean not null default true,
  supports_vision boolean not null default false,
  supports_tools boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (provider_id, model_key)
);

create table if not exists public.agent_ai_policies (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  group_id uuid not null references public.groups(id) on delete cascade,
  primary_model_id uuid not null references public.ai_models(id),
  fallback_model_id uuid references public.ai_models(id),
  temperature numeric(3,2) not null default 0.2 check (temperature >= 0 and temperature <= 2),
  max_output_tokens integer not null default 1000 check (max_output_tokens > 0),
  created_at timestamptz not null default now(),
  unique (agent_id, group_id)
);

create table if not exists public.jarbas_uploaded_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null,
  file_path text not null,
  original_name text not null,
  mime_type text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'linked', 'archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.jarbas_executions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid not null references public.groups(id),
  agent_id uuid not null references public.agents(id),
  workflow_id text not null,
  uploaded_file_id uuid references public.jarbas_uploaded_files(id),
  status text not null default 'created' check (
    status in (
      'created',
      'waiting_file',
      'file_received',
      'validating_excel',
      'processing',
      'paused_error',
      'waiting_user_action',
      'resuming',
      'finished',
      'failed',
      'cancelled'
    )
  ),
  current_step text not null default 'created',
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

create table if not exists public.jarbas_execution_steps (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.jarbas_executions(id) on delete cascade,
  step_key text not null,
  step_label text not null,
  status text not null default 'pending' check (status in ('pending', 'running', 'finished', 'failed', 'skipped')),
  progress_percent integer not null default 0 check (progress_percent >= 0 and progress_percent <= 100),
  started_at timestamptz,
  finished_at timestamptz,
  unique (execution_id, step_key)
);

create table if not exists public.jarbas_execution_logs (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.jarbas_executions(id) on delete cascade,
  level text not null check (level in ('info', 'warning', 'error')),
  message text not null,
  row_number integer,
  card_code text,
  cnpj text,
  raw_payload_ref text,
  created_at timestamptz not null default now()
);

create table if not exists public.jarbas_checklists (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references public.jarbas_executions(id) on delete cascade,
  label text not null,
  status text not null default 'pending' check (status in ('pending', 'done', 'error')),
  sort_order integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  execution_id uuid references public.jarbas_executions(id) on delete set null,
  role text not null check (role in ('user', 'assistant', 'system')),
  channel text not null check (channel in ('text', 'voice')),
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists user_groups_group_id_idx on public.user_groups (group_id);
create index if not exists agent_permissions_group_id_idx on public.agent_permissions (group_id);
create index if not exists ai_models_provider_id_idx on public.ai_models (provider_id);
create index if not exists agent_ai_policies_group_id_idx on public.agent_ai_policies (group_id);
create index if not exists agent_ai_policies_primary_model_id_idx on public.agent_ai_policies (primary_model_id);
create index if not exists agent_ai_policies_fallback_model_id_idx on public.agent_ai_policies (fallback_model_id);
create index if not exists jarbas_uploaded_files_user_id_idx on public.jarbas_uploaded_files (user_id);
create index if not exists jarbas_executions_user_id_idx on public.jarbas_executions (user_id);
create index if not exists jarbas_executions_group_id_idx on public.jarbas_executions (group_id);
create index if not exists jarbas_executions_agent_id_idx on public.jarbas_executions (agent_id);
create index if not exists jarbas_executions_uploaded_file_id_idx on public.jarbas_executions (uploaded_file_id);
create index if not exists jarbas_executions_status_idx on public.jarbas_executions (status);
create index if not exists jarbas_execution_logs_execution_id_created_at_idx on public.jarbas_execution_logs (execution_id, created_at);
create index if not exists jarbas_checklists_execution_id_sort_order_idx on public.jarbas_checklists (execution_id, sort_order);
create index if not exists conversation_history_user_id_created_at_idx on public.conversation_history (user_id, created_at);
create index if not exists conversation_history_execution_id_idx on public.conversation_history (execution_id);

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.user_groups enable row level security;
alter table public.agents enable row level security;
alter table public.agent_permissions enable row level security;
alter table public.ai_providers enable row level security;
alter table public.ai_models enable row level security;
alter table public.agent_ai_policies enable row level security;
alter table public.jarbas_uploaded_files enable row level security;
alter table public.jarbas_executions enable row level security;
alter table public.jarbas_execution_steps enable row level security;
alter table public.jarbas_execution_logs enable row level security;
alter table public.jarbas_checklists enable row level security;
alter table public.conversation_history enable row level security;
