import type {
  GetPortalExecutionResult,
  PortalAgent,
  PortalExecution,
  PortalFlow,
  PortalGatewayError,
  PortalGroup,
  StartPortalExecutionRequest,
  StartPortalExecutionResult,
} from "@/lib/portal/types";

const CONTRACT_WORKFLOW_PREFIX = "contract:";

type SupabaseLike = {
  from: (table: string) => unknown;
};

type QueryBuilder = {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order?: (...args: unknown[]) => QueryBuilder;
  limit?: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  single?: () => Promise<{ data: unknown; error: unknown }>;
  insert?: (payload: unknown) => QueryBuilder;
};

type ContractPortalFlowDefinition = {
  id: string;
  groupSlug: string;
  agentSlug: string;
  name: string;
  description: string;
  category: string;
  requiresInput: boolean;
  inputSchema: Record<string, unknown> | null;
  enabled: boolean;
  initialStep: string;
  initialProgress: number;
};

const CONTRACT_PORTAL_FLOWS: ContractPortalFlowDefinition[] = [
  {
    id: "portal-cargas-status",
    groupSlug: "solucoes",
    agentSlug: "operador-portal-cargas",
    name: "Status de Cargas",
    description: "Consulta status de fluxos no portal externo de cargas.",
    category: "monitoramento",
    requiresInput: false,
    inputSchema: null,
    enabled: true,
    initialStep: "consultando portal externo",
    initialProgress: 15,
  },
  {
    id: "portal-cargas-iniciar-fluxo",
    groupSlug: "solucoes",
    agentSlug: "operador-portal-cargas",
    name: "Iniciar Fluxo de Cargas",
    description: "Inicia um fluxo operacional no portal externo de cargas.",
    category: "operacao",
    requiresInput: true,
    inputSchema: {
      type: "object",
      properties: {
        fluxo: { type: "string" },
        referencia: { type: "string" },
      },
    },
    enabled: true,
    initialStep: "fluxo solicitado ao adapter de contrato",
    initialProgress: 10,
  },
  {
    id: "carga-pn-excel",
    groupSlug: "solucoes",
    agentSlug: "carga-pn-excel",
    name: "Carga PN Excel",
    description: "Fluxo legado para carga de parceiro de negocio via Excel.",
    category: "cadastro",
    requiresInput: true,
    inputSchema: {
      type: "object",
      properties: {
        uploadedFileId: { type: "string" },
      },
      required: ["uploadedFileId"],
    },
    enabled: true,
    initialStep: "fluxo legado disponivel no portal",
    initialProgress: 5,
  },
];

function asQueryBuilder(value: unknown): QueryBuilder {
  return value as QueryBuilder;
}

function gatewayError(status: number, error: string): PortalGatewayError {
  return { ok: false, status, error };
}

function normalizeGroupRows(data: unknown): PortalGroup[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      const group = (row as { groups?: unknown }).groups as
        | Partial<PortalGroup>
        | undefined;
      if (!group?.id || !group.name || !group.slug) return null;

      return {
        id: group.id,
        name: group.name,
        slug: group.slug,
      };
    })
    .filter((group): group is PortalGroup => Boolean(group));
}

function normalizeAgentRows(data: unknown): PortalAgent[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      const agent = (row as { agents?: unknown }).agents as
        | Partial<PortalAgent>
        | undefined;
      if (!agent?.id || !agent.name || !agent.slug) return null;

      return {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        description: agent.description ?? "",
      };
    })
    .filter((agent): agent is PortalAgent => Boolean(agent));
}

function normalizeInput(input: unknown): Record<string, unknown> | undefined {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return undefined;
  }

  return input as Record<string, unknown>;
}

function normalizeSummary(summary: unknown): Record<string, unknown> {
  if (!summary || typeof summary !== "object" || Array.isArray(summary)) {
    return {};
  }

  return summary as Record<string, unknown>;
}

function flowIdFromWorkflow(workflowId: unknown) {
  if (typeof workflowId !== "string") return "unknown";
  if (workflowId.startsWith(CONTRACT_WORKFLOW_PREFIX)) {
    return workflowId.slice(CONTRACT_WORKFLOW_PREFIX.length);
  }

  return workflowId;
}

function toPortalFlow({
  definition,
  group,
  agent,
}: {
  definition: ContractPortalFlowDefinition;
  group: PortalGroup;
  agent: PortalAgent;
}): PortalFlow {
  return {
    id: definition.id,
    groupId: group.id,
    agentId: agent.id,
    name: definition.name,
    description: definition.description,
    category: definition.category,
    requiresInput: definition.requiresInput,
    inputSchema: definition.inputSchema,
    enabled: definition.enabled,
  };
}

function getFlowDefinition(flowId: string) {
  return CONTRACT_PORTAL_FLOWS.find((flow) => flow.id === flowId) ?? null;
}

export function listPortalFlowsForContext({
  groups,
  permittedAgents,
}: {
  groups: PortalGroup[];
  permittedAgents: PortalAgent[];
}): PortalFlow[] {
  const groupsBySlug = new Map(groups.map((group) => [group.slug, group]));
  const agentsBySlug = new Map(
    permittedAgents.map((agent) => [agent.slug, agent]),
  );

  return CONTRACT_PORTAL_FLOWS.flatMap((definition) => {
    const group = groupsBySlug.get(definition.groupSlug);
    const agent = agentsBySlug.get(definition.agentSlug);

    if (!group || !agent || !definition.enabled) return [];

    return [toPortalFlow({ definition, group, agent })];
  });
}

export function findAccessiblePortalFlow({
  flowId,
  groupId,
  groups,
  permittedAgents,
}: {
  flowId: string;
  groupId: string;
  groups: PortalGroup[];
  permittedAgents: PortalAgent[];
}): PortalFlow | null {
  return (
    listPortalFlowsForContext({ groups, permittedAgents }).find(
      (flow) => flow.id === flowId && flow.groupId === groupId,
    ) ?? null
  );
}

export function mapPortalExecutionRow(row: unknown): PortalExecution {
  const execution = row as {
    id?: string;
    group_id?: string;
    workflow_id?: string;
    status?: string;
    current_step?: string;
    progress_percent?: number;
    summary?: unknown;
    created_at?: string;
  };
  const summary = normalizeSummary(execution.summary);
  const flowId =
    typeof summary.flowId === "string"
      ? summary.flowId
      : flowIdFromWorkflow(execution.workflow_id);
  const flowName = typeof summary.flowName === "string" ? summary.flowName : flowId;

  return {
    id: execution.id ?? "",
    groupId: execution.group_id ?? "",
    flowId,
    flowName,
    status: execution.status ?? "unknown",
    currentStep: execution.current_step ?? "unknown",
    progressPercent: execution.progress_percent ?? 0,
    summary,
    createdAt: execution.created_at ?? "",
  };
}

export async function loadPortalAccessContext({
  supabase,
  userId,
}: {
  supabase: SupabaseLike;
  userId: string;
}): Promise<{ groups: PortalGroup[]; permittedAgents: PortalAgent[] }> {
  const groupsQuery = asQueryBuilder(supabase.from("user_groups"));
  const { data: groupRows } = await groupsQuery
    .select("groups(id,name,slug)")
    .eq("user_id", userId)
    .limit!(50);
  const groups = normalizeGroupRows(groupRows);

  const permittedAgents: PortalAgent[] = [];
  for (const group of groups) {
    const agentsQuery = asQueryBuilder(supabase.from("agent_permissions"));
    const { data: agentRows } = await agentsQuery
      .select("agents(id,name,slug,description)")
      .eq("group_id", group.id)
      .eq("can_execute", true)
      .limit!(100);

    permittedAgents.push(...normalizeAgentRows(agentRows));
  }

  return { groups, permittedAgents };
}

export async function listPortalFlows({
  supabase,
  userId,
}: {
  supabase: SupabaseLike;
  userId: string;
}): Promise<PortalFlow[]> {
  const context = await loadPortalAccessContext({ supabase, userId });
  return listPortalFlowsForContext(context);
}

export async function startPortalExecution({
  supabase,
  userId,
  request,
}: {
  supabase: SupabaseLike;
  userId: string;
  request: StartPortalExecutionRequest;
}): Promise<StartPortalExecutionResult> {
  const flowId = request.flowId?.trim();
  const groupId = request.groupId?.trim();

  if (!flowId || !groupId) {
    return gatewayError(400, "flow_id_and_group_id_required");
  }

  const context = await loadPortalAccessContext({ supabase, userId });
  const flow = findAccessiblePortalFlow({
    flowId,
    groupId,
    groups: context.groups,
    permittedAgents: context.permittedAgents,
  });
  const definition = getFlowDefinition(flowId);

  if (!flow || !definition) {
    return gatewayError(403, "flow_not_allowed_for_group");
  }

  const summary = {
    adapter: "ContractPortalAdapter",
    flowId: flow.id,
    flowName: flow.name,
    category: flow.category,
    input: normalizeInput(request.input) ?? {},
  };
  const insertQuery = asQueryBuilder(supabase.from("jarbas_executions"));
  const { data: execution, error } = await insertQuery
    .insert!({
      user_id: userId,
      group_id: flow.groupId,
      agent_id: flow.agentId,
      workflow_id: `${CONTRACT_WORKFLOW_PREFIX}${flow.id}`,
      status: "processing",
      current_step: definition.initialStep,
      progress_percent: definition.initialProgress,
      summary,
    })
    .select(
      "id,group_id,workflow_id,status,current_step,progress_percent,summary,created_at",
    )
    .single!();

  if (error || !execution) {
    return gatewayError(500, "portal_execution_create_failed");
  }

  return {
    ok: true,
    execution: mapPortalExecutionRow(execution),
  };
}

export async function listPortalExecutions({
  supabase,
  userId,
  groupId,
}: {
  supabase: SupabaseLike;
  userId: string;
  groupId?: string | null;
}): Promise<PortalExecution[]> {
  const context = await loadPortalAccessContext({ supabase, userId });
  const allowedGroupIds = new Set(context.groups.map((group) => group.id));
  const targetGroupIds = groupId ? [groupId] : [...allowedGroupIds];

  if (targetGroupIds.some((targetGroupId) => !allowedGroupIds.has(targetGroupId))) {
    return [];
  }

  const rows: unknown[] = [];
  for (const targetGroupId of targetGroupIds) {
    const query = asQueryBuilder(supabase.from("jarbas_executions"));
    const { data } = await query
      .select(
        "id,group_id,workflow_id,status,current_step,progress_percent,summary,created_at",
      )
      .eq("user_id", userId)
      .eq("group_id", targetGroupId)
      .order!("created_at", { ascending: false })
      .limit!(20);

    if (Array.isArray(data)) rows.push(...data);
  }

  return rows.map(mapPortalExecutionRow);
}

export async function getPortalExecution({
  supabase,
  userId,
  executionId,
}: {
  supabase: SupabaseLike;
  userId: string;
  executionId: string;
}): Promise<GetPortalExecutionResult> {
  const context = await loadPortalAccessContext({ supabase, userId });
  const allowedGroupIds = new Set(context.groups.map((group) => group.id));
  const query = asQueryBuilder(supabase.from("jarbas_executions"));
  const { data: execution } = await query
    .select(
      "id,group_id,workflow_id,status,current_step,progress_percent,summary,created_at",
    )
    .eq("id", executionId)
    .eq("user_id", userId)
    .single!();

  if (!execution) {
    return gatewayError(404, "execution_not_found");
  }

  const portalExecution = mapPortalExecutionRow(execution);
  if (!allowedGroupIds.has(portalExecution.groupId)) {
    return gatewayError(403, "execution_not_allowed_for_group");
  }

  return {
    ok: true,
    execution: portalExecution,
  };
}
