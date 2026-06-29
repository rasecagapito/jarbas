import { describe, expect, it } from "vitest";
import { handleJarbasCommand } from "@/lib/jarbas/commands";
import type { JarbasContext } from "@/lib/jarbas/context";

const context: JarbasContext = {
  profile: { displayName: "Cesar", email: "cesar@example.com" },
  groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
  permittedAgents: [
    {
      id: "agent-id",
      name: "Carga PN Excel",
      slug: "carga-pn-excel",
      description: "Executa carga PN via Excel.",
    },
  ],
  recentMessages: [
    {
      role: "user",
      channel: "text",
      message: "Quero continuar a carga.",
      createdAt: "2026-06-29T10:00:00Z",
    },
  ],
  recentExecutions: [
    {
      id: "execution-id",
      status: "processing",
      currentStep: "validando Excel",
      progressPercent: 35,
      createdAt: "2026-06-29T10:01:00Z",
    },
  ],
  memories: [],
};

describe("Jarbas internal commands", () => {
  it("returns an operational status from the safe context", () => {
    const result = handleJarbasCommand("/status", context);

    expect(result).toEqual({
      handled: true,
      command: "/status",
      persistAsMemory: false,
      message: expect.stringContaining("Status operacional do Jarbas"),
    });
    expect(result.handled).toBe(true);
    if (!result.handled) throw new Error("Expected handled command");
    expect(result.message).toContain("Usuario: Cesar");
    expect(result.message).toContain("Grupo ativo: Solucoes");
    expect(result.message).toContain("Agentes permitidos: Carga PN Excel");
    expect(result.message).toContain("processing");
  });

  it("lists only memories already available in the current context", () => {
    const result = handleJarbasCommand("/memoria", context);

    expect(result.handled).toBe(true);
    if (!result.handled) throw new Error("Expected handled command");
    expect(result.command).toBe("/memoria");
    expect(result.message).toContain("Memorias acessiveis");
    expect(result.message).toContain("Quero continuar a carga.");
  });

  it("creates a wrapup response marked for memory persistence", () => {
    const result = handleJarbasCommand("/wrapup", context);

    expect(result).toEqual({
      handled: true,
      command: "/wrapup",
      persistAsMemory: true,
      message: expect.stringContaining("Resumo da sessao"),
    });
    expect(result.handled).toBe(true);
    if (!result.handled) throw new Error("Expected handled command");
    expect(result.message).toContain("Pendencias");
    expect(result.message).toContain("Proximos passos");
  });

  it("returns guidance for unknown slash commands", () => {
    const result = handleJarbasCommand("/desconhecido", context);

    expect(result).toEqual({
      handled: true,
      command: "unknown",
      persistAsMemory: false,
      message:
        "Comando nao reconhecido. Use /status, /wrapup ou /memoria.",
    });
  });

  it("does not handle normal messages", () => {
    expect(handleJarbasCommand("Ola Jarbas", context)).toEqual({
      handled: false,
    });
  });
});
