import type { JarbasContext } from "@/lib/jarbas/context";

export type JarbasSummaryIntentResult =
  | {
      handled: false;
    }
  | {
      handled: true;
      message: string;
    };

function normalizeText(message: string) {
  return message
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function isSummaryIntent(message: string) {
  const normalized = normalizeText(message);

  return (
    /\bresumo\b/.test(normalized) ||
    /\bresumir\b/.test(normalized) ||
    /\bsumario\b/.test(normalized) ||
    /\brecapitul/.test(normalized)
  );
}

function listOrNone(values: string[]) {
  return values.length > 0 ? values.join(", ") : "nenhum";
}

function createExecutionLine(context: JarbasContext) {
  const execution = context.recentExecutions[0];

  if (!execution) {
    return "Execucao recente: nenhuma execucao recente no grupo ativo.";
  }

  return `Execucao recente: ${execution.status} - ${execution.currentStep} (${execution.progressPercent}%).`;
}

function createMemoryLine(context: JarbasContext) {
  if (context.memories.length === 0) {
    return "Memorias: nenhuma memoria estruturada disponivel para este grupo.";
  }

  return `Memorias: ${listOrNone(
    context.memories.slice(0, 3).map((memory) => memory.title),
  )}.`;
}

export function handleJarbasSummaryIntent({
  message,
  context,
}: {
  message: string;
  context: JarbasContext;
}): JarbasSummaryIntentResult {
  if (!isSummaryIntent(message)) {
    return { handled: false };
  }

  const user = context.profile.displayName ?? "nao informado";
  const activeGroup = context.activeGroup?.name ?? "nenhum";
  const agents = listOrNone(context.permittedAgents.map((agent) => agent.name));
  const flows = listOrNone(context.permittedFlows.map((flow) => flow.name));

  return {
    handled: true,
    message: [
      "Resumo operacional do Jarbas",
      `Usuario: ${user}.`,
      `Grupo ativo: ${activeGroup}.`,
      `Agentes permitidos: ${agents}.`,
      `Fluxos disponiveis: ${flows}.`,
      createExecutionLine(context),
      createMemoryLine(context),
      "Proxima acao: escolha um fluxo do portal, peca status ou detalhe qual execucao deseja analisar.",
    ].join("\n"),
  };
}
