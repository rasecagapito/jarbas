import type { JarbasContext } from "@/lib/jarbas/context";

export type JarbasCommandName = "/status" | "/wrapup" | "/memoria";

export type JarbasCommandHandled = {
  handled: true;
  command: JarbasCommandName | "unknown";
  message: string;
  persistAsMemory: boolean;
};

export type JarbasCommandResult =
  | JarbasCommandHandled
  | {
      handled: false;
    };

function listOrNone(values: string[]) {
  return values.length > 0 ? values.join(", ") : "nenhum";
}

function createStatus(context: JarbasContext) {
  const user = context.profile.displayName ?? "nao informado";
  const activeGroup = context.activeGroup?.name ?? "nenhum";
  const agents = listOrNone(context.permittedAgents.map((agent) => agent.name));
  const flows = listOrNone(context.permittedFlows.map((flow) => flow.name));
  const latestExecution = context.recentExecutions[0];
  const executionStatus = latestExecution
    ? `${latestExecution.status} - ${latestExecution.currentStep} (${latestExecution.progressPercent}%)`
    : "nenhuma execucao recente encontrada";

  return [
    "Status operacional do Jarbas",
    `Usuario: ${user}`,
    `Grupo ativo: ${activeGroup}`,
    `Agentes permitidos: ${agents}`,
    `Fluxos permitidos: ${flows}`,
    `Ultima execucao: ${executionStatus}`,
    "Proxima acao sugerida: informe o que deseja executar ou consulte /memoria.",
  ].join("\n");
}

function createMemoryList(context: JarbasContext) {
  if (context.memories.length > 0) {
    const memories = context.memories
      .slice(0, 8)
      .map(
        (memory, index) =>
          `${index + 1}. [${memory.scope}] ${memory.title}: ${memory.body}`,
      )
      .join("\n");

    return ["Memorias acessiveis", memories].join("\n");
  }

  if (context.recentMessages.length === 0) {
    return "Memorias acessiveis: nao encontrei historico recente para este usuario no contexto atual.";
  }

  const memories = context.recentMessages
    .slice(0, 5)
    .map((message, index) => `${index + 1}. [${message.role}/${message.channel}] ${message.message}`)
    .join("\n");

  return ["Memorias acessiveis", memories].join("\n");
}

function createWrapup(context: JarbasContext) {
  const latestMessages = context.recentMessages
    .slice(0, 5)
    .map((message) => `- ${message.role}/${message.channel}: ${message.message}`)
    .join("\n");
  const latestExecutions = context.recentExecutions
    .slice(0, 3)
    .map(
      (execution) =>
        `- ${execution.id}: ${execution.status}, ${execution.currentStep}, ${execution.progressPercent}%`,
    )
    .join("\n");

  return [
    "Resumo da sessao",
    latestMessages || "- Sem mensagens recentes no contexto atual.",
    "",
    "Execucoes relacionadas",
    latestExecutions || "- Sem execucoes recentes no contexto atual.",
    "",
    "Pendencias",
    "- Confirmar a proxima acao operacional com o usuario.",
    "",
    "Proximos passos",
    "- Continuar pelo objetivo informado no chat ou consultar /status.",
  ].join("\n");
}

export function handleJarbasCommand(
  message: string,
  context: JarbasContext,
): JarbasCommandResult {
  const command = message.trim().toLowerCase();

  if (!command.startsWith("/")) {
    return { handled: false };
  }

  if (command === "/status") {
    return {
      handled: true,
      command: "/status",
      message: createStatus(context),
      persistAsMemory: false,
    };
  }

  if (command === "/memoria") {
    return {
      handled: true,
      command: "/memoria",
      message: createMemoryList(context),
      persistAsMemory: false,
    };
  }

  if (command === "/wrapup") {
    return {
      handled: true,
      command: "/wrapup",
      message: createWrapup(context),
      persistAsMemory: true,
    };
  }

  return {
    handled: true,
    command: "unknown",
    message: "Comando nao reconhecido. Use /status, /wrapup ou /memoria.",
    persistAsMemory: false,
  };
}
