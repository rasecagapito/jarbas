import type { JarbasContext } from "@/lib/jarbas/context";
import { startPortalExecution } from "@/lib/portal/gateway";
import type { PortalExecution } from "@/lib/portal/types";

type SupabaseLike = {
  from: (table: string) => unknown;
};

export type JarbasPortalIntentResult =
  | {
      handled: false;
    }
  | {
      handled: true;
      action: "start_execution";
      message: string;
      execution?: PortalExecution;
      error?: string;
    };

function normalizeText(message: string) {
  return message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isPortalStartIntent(message: string) {
  const normalized = normalizeText(message);
  const mentionsPortal = /\bportal\b/.test(normalized);
  const asksToStart =
    /\biniciar\b/.test(normalized) ||
    /\binicia\b/.test(normalized) ||
    /\bexecutar\b/.test(normalized) ||
    /\bexecuta\b/.test(normalized) ||
    /\bprocessar\b/.test(normalized) ||
    /\bprocessa\b/.test(normalized) ||
    /\brodar\b/.test(normalized) ||
    /\bdisparar\b/.test(normalized) ||
    /\benviar\b/.test(normalized) ||
    /\benvie\b/.test(normalized) ||
    /\bmandar\b/.test(normalized) ||
    /\bmande\b/.test(normalized);

  return mentionsPortal && asksToStart;
}

function getDefaultPortalFlow(context: JarbasContext) {
  const activeGroupId = context.activeGroup?.id;
  if (!activeGroupId) return null;

  return (
    context.permittedFlows.find(
      (flow) =>
        flow.groupId === activeGroupId &&
        flow.id === "portal-cargas-iniciar-fluxo",
    ) ??
    context.permittedFlows.find(
      (flow) => flow.groupId === activeGroupId && flow.category === "operacao",
    ) ??
    null
  );
}

export async function handleJarbasPortalIntent({
  message,
  context,
  supabase,
  userId,
}: {
  message: string;
  context: JarbasContext;
  supabase: SupabaseLike;
  userId: string;
}): Promise<JarbasPortalIntentResult> {
  if (!isPortalStartIntent(message)) {
    return { handled: false };
  }

  if (!context.activeGroup) {
    return {
      handled: true,
      action: "start_execution",
      message:
        "Nao consegui iniciar o fluxo no portal porque nao ha grupo ativo no contexto do Jarbas.",
      error: "active_group_required",
    };
  }

  const flow = getDefaultPortalFlow(context);

  if (!flow) {
    return {
      handled: true,
      action: "start_execution",
      message:
        "Nao encontrei um fluxo de portal autorizado para o grupo ativo.",
      error: "portal_flow_not_available",
    };
  }

  const result = await startPortalExecution({
    supabase,
    userId,
    request: {
      flowId: flow.id,
      groupId: context.activeGroup.id,
      input: {
        source: "jarbas-chat",
        message,
      },
    },
  });

  if (!result.ok) {
    return {
      handled: true,
      action: "start_execution",
      message:
        "Nao consegui iniciar o fluxo no portal agora. Confirme se as migrations e permissoes do grupo foram aplicadas em HOM.",
      error: result.error,
    };
  }

  return {
    handled: true,
    action: "start_execution",
    message: `Fluxo de portal iniciado: ${result.execution.flowName}. Execucao ${result.execution.id} em ${result.execution.currentStep} (${result.execution.progressPercent}%).`,
    execution: result.execution,
  };
}
