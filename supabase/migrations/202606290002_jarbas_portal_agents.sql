insert into public.agents (name, slug, description)
values
  (
    'Operador Portal de Cargas',
    'operador-portal-cargas',
    'Lista, inicia e acompanha fluxos do portal externo de cargas no escopo do grupo.'
  ),
  (
    'Consultor SAP B1',
    'consultor-sap-b1',
    'Responde duvidas SAP Business One em modo somente leitura e escopo por grupo.'
  )
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  active = true;

insert into public.agent_permissions (agent_id, group_id, can_execute)
select a.id, g.id, true
from public.agents a
join public.groups g on g.slug = 'solucoes'
where a.slug in ('operador-portal-cargas', 'consultor-sap-b1')
on conflict (agent_id, group_id) do update
set can_execute = excluded.can_execute;
