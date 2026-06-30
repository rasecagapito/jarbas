import {
  listAccessibleJarbasMemories,
  type JarbasMemory,
} from "@/lib/jarbas/memory";
import { listPortalFlowsForContext } from "@/lib/portal/gateway";
import type { PortalFlow } from "@/lib/portal/types";

type SupabaseLike = {
  from: (table: string) => unknown;
};

type QueryBuilder = {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order?: (...args: unknown[]) => QueryBuilder;
  limit?: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  maybeSingle?: () => Promise<{ data: unknown; error: unknown }>;
};

export type JarbasContextProfile = {
  displayName: string | null;
  email: string | null;
};

export type JarbasContextGroup = {
  id: string;
  name: string;
  slug: string;
};

export type JarbasContextAgent = {
  id: string;
  name: string;
  slug: string;
  description: string;
};

export type JarbasContextMessage = {
  role: string;
  channel: string;
  message: string;
  createdAt: string;
};

export type JarbasContextExecution = {
  id: string;
  groupId: string;
  status: string;
  currentStep: string;
  progressPercent: number;
  createdAt: string;
};

export type JarbasContext = {
  profile: JarbasContextProfile;
  activeGroup: JarbasContextGroup | null;
  groups: JarbasContextGroup[];
  permittedAgents: JarbasContextAgent[];
  permittedFlows: PortalFlow[];
  recentMessages: JarbasContextMessage[];
  recentExecutions: JarbasContextExecution[];
  memories: JarbasMemory[];
};

function asQueryBuilder(value: unknown): QueryBuilder {
  return value as QueryBuilder;
}

function normalizeGroupRows(data: unknown): JarbasContextGroup[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      const group = (row as { groups?: unknown }).groups as
        | JarbasContextGroup
        | undefined;
      if (!group?.id || !group.name || !group.slug) return null;

      return {
        id: group.id,
        name: group.name,
        slug: group.slug,
      };
    })
    .filter((group): group is JarbasContextGroup => Boolean(group));
}

function normalizeAgentRows(data: unknown): JarbasContextAgent[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      const agent = (row as { agents?: unknown }).agents as
        | JarbasContextAgent
        | undefined;
      if (!agent?.id || !agent.name || !agent.slug) return null;

      return {
        id: agent.id,
        name: agent.name,
        slug: agent.slug,
        description: agent.description ?? "",
      };
    })
    .filter((agent): agent is JarbasContextAgent => Boolean(agent));
}

function normalizeMessages(data: unknown): JarbasContextMessage[] {
  if (!Array.isArray(data)) return [];

  return data.map((row) => {
    const message = row as {
      role?: string;
      channel?: string;
      message?: string;
      created_at?: string;
    };

    return {
      role: message.role ?? "user",
      channel: message.channel ?? "text",
      message: message.message ?? "",
      createdAt: message.created_at ?? "",
    };
  });
}

function normalizeExecutions(data: unknown): JarbasContextExecution[] {
  if (!Array.isArray(data)) return [];

  return data.map((row) => {
    const execution = row as {
      id?: string;
      group_id?: string;
      status?: string;
      current_step?: string;
      progress_percent?: number;
      created_at?: string;
    };

    return {
      id: execution.id ?? "",
      groupId: execution.group_id ?? "",
      status: execution.status ?? "unknown",
      currentStep: execution.current_step ?? "unknown",
      progressPercent: execution.progress_percent ?? 0,
      createdAt: execution.created_at ?? "",
    };
  });
}

export async function buildJarbasContext({
  supabase,
  userId,
  activeGroupId,
}: {
  supabase: SupabaseLike;
  userId: string;
  activeGroupId?: string | null;
}): Promise<JarbasContext> {
  const profileQuery = asQueryBuilder(supabase.from("profiles"));
  const { data: profileData } = await profileQuery
    .select("display_name,email")
    .eq("user_id", userId)
    .maybeSingle!();
  const profileRow = profileData as
    | { display_name?: string | null; email?: string | null }
    | null;

  const groupsQuery = asQueryBuilder(supabase.from("user_groups"));
  const { data: groupRows } = await groupsQuery
    .select("groups(id,name,slug)")
    .eq("user_id", userId)
    .limit!(20);
  const groups = normalizeGroupRows(groupRows);
  const activeGroup =
    groups.find((group) => group.id === activeGroupId) ?? groups[0] ?? null;

  const permittedAgents: JarbasContextAgent[] = [];
  for (const group of activeGroup ? [activeGroup] : []) {
    const agentsQuery = asQueryBuilder(supabase.from("agent_permissions"));
    const { data: agentRows } = await agentsQuery
      .select("agents(id,name,slug,description)")
      .eq("group_id", group.id)
      .eq("can_execute", true)
      .limit!(50);

    permittedAgents.push(...normalizeAgentRows(agentRows));
  }

  let messageRows: unknown = [];
  if (activeGroup) {
    const messagesQuery = asQueryBuilder(supabase.from("conversation_history"));
    const { data } = await messagesQuery
      .select("role,channel,message,created_at")
      .eq("user_id", userId)
      .eq("group_id", activeGroup.id)
      .order!("created_at", { ascending: false })
      .limit!(8);

    messageRows = data;
  }

  let executionRows: unknown = [];
  if (activeGroup) {
    const executionsQuery = asQueryBuilder(supabase.from("jarbas_executions"));
    const { data } = await executionsQuery
      .select("id,group_id,status,current_step,progress_percent,created_at")
      .eq("user_id", userId)
      .eq("group_id", activeGroup.id)
      .order!("created_at", { ascending: false })
      .limit!(5);

    executionRows = data;
  }
  const recentExecutions = normalizeExecutions(executionRows);
  const memories = await listAccessibleJarbasMemories({
    supabase,
    userId,
    groupIds: activeGroup ? [activeGroup.id] : [],
  });
  const permittedFlows = listPortalFlowsForContext({
    groups,
    permittedAgents,
  });

  return {
    profile: {
      displayName: profileRow?.display_name?.trim() || null,
      email: profileRow?.email?.trim() || null,
    },
    activeGroup,
    groups,
    permittedAgents,
    permittedFlows,
    recentMessages: normalizeMessages(messageRows),
    recentExecutions,
    memories,
  };
}

export function createJarbasSystemPrompt(context: JarbasContext): string {
  const displayName = context.profile.displayName ?? "nao informado";
  const activeGroup = context.activeGroup?.name ?? "nenhum";
  const groups = context.groups.map((group) => group.name).join(", ") || "nenhum";
  const agents =
    context.permittedAgents.map((agent) => agent.name).join(", ") || "nenhum";
  const flows =
    context.permittedFlows.map((flow) => flow.name).join(", ") || "nenhum";
  const messages =
    context.recentMessages
      .map((message) => `${message.role}/${message.channel}: ${message.message}`)
      .join(" | ") || "sem historico recente";
  const executions =
    context.recentExecutions
      .map(
        (execution) =>
          `${execution.id}: ${execution.status}, ${execution.currentStep}, ${execution.progressPercent}%`,
      )
      .join(" | ") || "sem execucoes recentes";
  const memories =
    context.memories
      .map((memory) => `${memory.title}: ${memory.body}`)
      .join(" | ") || "sem memorias estruturadas";

  return [
    "Voce e o Jarbas, o orquestrador inteligente do cockpit S.A.M.",
    "Responda em portugues do Brasil, de forma clara, operacional e segura.",
    `Usuario: ${displayName}`,
    `E-mail: ${context.profile.email ?? "nao informado"}`,
    `Grupo ativo: ${activeGroup}`,
    `Grupos ativos: ${groups}`,
    `Agentes permitidos: ${agents}`,
    `Fluxos permitidos: ${flows}`,
    `Historico recente: ${messages}`,
    `Execucoes recentes: ${executions}`,
    `Memorias estruturadas: ${memories}`,
    "Nunca use memoria, execucao, fluxo ou regra de outro grupo. Se houver mais de um grupo, responda somente dentro do grupo ativo ou peca confirmacao.",
    "Nao invente nome, grupo, memoria, historico, execucao, status, agentes permitidos ou resultados.",
    "Se nao houver informacoes suficientes no contexto atual, diga isso claramente.",
  ].join("\n");
}
