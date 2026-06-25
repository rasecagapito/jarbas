insert into public.groups (name, slug)
values
  ('Solucoes', 'solucoes'),
  ('Consultoria', 'consultoria'),
  ('Administrativo', 'administrativo')
on conflict (slug) do nothing;

insert into public.agents (name, slug, description)
values (
  'Carga PN Excel',
  'carga-pn-excel',
  'Executa carga de Parceiro de Negocio via Excel padrao usando workflow n8n Jarbas.'
)
on conflict (slug) do nothing;

insert into public.agent_permissions (agent_id, group_id, can_execute)
select a.id, g.id, true
from public.agents a
join public.groups g on g.slug = 'solucoes'
where a.slug = 'carga-pn-excel'
on conflict (agent_id, group_id) do update set can_execute = excluded.can_execute;

insert into public.ai_providers (name, slug, base_url, auth_mode, secret_ref)
values
  ('OpenAI', 'openai', null, 'api_key', 'OPENAI_API_KEY'),
  ('Anthropic', 'anthropic', null, 'api_key', 'ANTHROPIC_API_KEY'),
  ('GLM', 'glm', null, 'api_key', 'GLM_API_KEY'),
  ('OpenAI Compatible', 'openai_compatible', 'OPENAI_COMPATIBLE_BASE_URL', 'api_key', 'OPENAI_COMPATIBLE_API_KEY')
on conflict (slug) do nothing;

insert into public.ai_models (provider_id, model_key, display_name, supports_text, supports_vision, supports_tools)
select p.id, 'default-chat', 'Default Chat Model', true, false, true
from public.ai_providers p
where p.slug = 'openai'
on conflict (provider_id, model_key) do nothing;

insert into public.agent_ai_policies (
  agent_id,
  group_id,
  primary_model_id,
  temperature,
  max_output_tokens
)
select a.id, g.id, m.id, 0.2, 1000
from public.agents a
join public.groups g on g.slug = 'solucoes'
join public.ai_providers p on p.slug = 'openai'
join public.ai_models m on m.provider_id = p.id and m.model_key = 'default-chat'
where a.slug = 'carga-pn-excel'
on conflict (agent_id, group_id) do update set
  primary_model_id = excluded.primary_model_id,
  temperature = excluded.temperature,
  max_output_tokens = excluded.max_output_tokens;
