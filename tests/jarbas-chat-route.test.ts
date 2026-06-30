import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/jarbas/chat/route";
import { callAiProvider } from "@/lib/ai/provider";
import { buildJarbasContext } from "@/lib/jarbas/context";
import { saveJarbasWrapupMemory } from "@/lib/jarbas/memory";
import { startPortalExecution } from "@/lib/portal/gateway";

const insertMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
    },
    from: (table: string) => {
      if (table !== "conversation_history") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        insert: insertMock,
      };
    },
  })),
}));

vi.mock("@/lib/ai/provider", () => ({
  callAiProvider: vi.fn(),
}));

vi.mock("@/lib/jarbas/context", () => ({
  buildJarbasContext: vi.fn(),
  createJarbasSystemPrompt: vi.fn(() => "contexto seguro do Jarbas"),
}));

vi.mock("@/lib/jarbas/memory", () => ({
  saveJarbasWrapupMemory: vi.fn(),
}));

vi.mock("@/lib/portal/gateway", () => ({
  startPortalExecution: vi.fn(),
}));

describe("POST /api/jarbas/chat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated user", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: null },
      error: null,
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/chat", {
        method: "POST",
        body: JSON.stringify({ message: "Ola" }),
      }),
    );

    expect(response.status).toBe(401);
  });

  it("persists user and assistant messages and returns the Jarbas response", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(buildJarbasContext).mockResolvedValueOnce({
      profile: { displayName: "Cesar", email: null },
      activeGroup: { id: "group-id", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
      permittedFlows: [],
      recentMessages: [],
      recentExecutions: [],
      memories: [],
    });
    vi.mocked(callAiProvider).mockResolvedValueOnce({
      ok: true,
      content: "Estou pronto para ajudar.",
      providerSlug: "openai",
      modelKey: "gpt-jarbas",
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Ola Jarbas",
          channel: "text",
          groupId: "group-id",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(buildJarbasContext).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-id",
        activeGroupId: "group-id",
      }),
    );
    expect(callAiProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: "system", content: "contexto seguro do Jarbas" },
          { role: "user", content: "Ola Jarbas" },
        ],
      }),
    );
    expect(payload).toEqual({
      message: "Estou pronto para ajudar.",
      channel: "text",
    });
    expect(insertMock).toHaveBeenCalledWith([
      {
        user_id: "user-id",
        group_id: "group-id",
        role: "user",
        channel: "text",
        message: "Ola Jarbas",
      },
      {
        user_id: "user-id",
        group_id: "group-id",
        role: "assistant",
        channel: "text",
        message: "Estou pronto para ajudar.",
      },
    ]);
  });

  it("handles internal commands without calling the AI provider", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(buildJarbasContext).mockResolvedValueOnce({
      profile: { displayName: "Cesar", email: null },
      activeGroup: { id: "group-id", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
      permittedFlows: [],
      recentMessages: [],
      recentExecutions: [],
      memories: [],
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/chat", {
        method: "POST",
        body: JSON.stringify({ message: "/status", channel: "text" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(callAiProvider).not.toHaveBeenCalled();
    expect(payload.message).toContain("Status operacional do Jarbas");
    expect(insertMock).toHaveBeenCalledWith([
      {
        user_id: "user-id",
        group_id: "group-id",
        role: "user",
        channel: "text",
        message: "/status",
      },
      {
        user_id: "user-id",
        group_id: "group-id",
        role: "assistant",
        channel: "text",
        message: payload.message,
      },
    ]);
  });

  it("starts a portal execution from a portal chat intent without calling the AI provider", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(buildJarbasContext).mockResolvedValueOnce({
      profile: { displayName: "Cesar", email: null },
      activeGroup: { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-solucoes", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
      permittedFlows: [
        {
          id: "portal-cargas-iniciar-fluxo",
          groupId: "group-solucoes",
          agentId: "agent-portal",
          name: "Iniciar Fluxo de Cargas",
          description: "Inicia fluxo no portal.",
          category: "operacao",
          requiresInput: true,
          inputSchema: null,
          enabled: true,
        },
      ],
      recentMessages: [],
      recentExecutions: [],
      memories: [],
    });
    vi.mocked(startPortalExecution).mockResolvedValueOnce({
      ok: true,
      execution: {
        id: "portal-execution-id",
        groupId: "group-solucoes",
        flowId: "portal-cargas-iniciar-fluxo",
        flowName: "Iniciar Fluxo de Cargas",
        status: "processing",
        currentStep: "fluxo solicitado ao adapter de contrato",
        progressPercent: 10,
        summary: {},
        createdAt: "2026-06-29T20:00:00Z",
      },
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "Jarbas, enviar mensagem para o portal",
          channel: "text",
          groupId: "group-solucoes",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(callAiProvider).not.toHaveBeenCalled();
    expect(startPortalExecution).toHaveBeenCalledWith({
      supabase: expect.anything(),
      userId: "user-id",
      request: {
        flowId: "portal-cargas-iniciar-fluxo",
        groupId: "group-solucoes",
        input: {
          source: "jarbas-chat",
          message: "Jarbas, enviar mensagem para o portal",
        },
      },
    });
    expect(payload).toEqual({
      message: expect.stringContaining("Fluxo de portal iniciado"),
      channel: "text",
      portal: {
        handled: true,
        action: "start_execution",
        execution: expect.objectContaining({
          id: "portal-execution-id",
        }),
      },
    });
    expect(insertMock).toHaveBeenCalledWith([
      {
        user_id: "user-id",
        group_id: "group-solucoes",
        role: "user",
        channel: "text",
        message: "Jarbas, enviar mensagem para o portal",
      },
      {
        user_id: "user-id",
        group_id: "group-solucoes",
        role: "assistant",
        channel: "text",
        message: payload.message,
      },
    ]);
  });

  it("answers natural summary requests from deterministic context without calling the AI provider", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(buildJarbasContext).mockResolvedValueOnce({
      profile: { displayName: "Homologacao Jarbas", email: null },
      activeGroup: { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-solucoes", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [
        {
          id: "agent-carga",
          name: "Carga PN Excel",
          slug: "carga-pn-excel",
          description: "Carga PN.",
        },
        {
          id: "agent-portal",
          name: "Operador Portal de Cargas",
          slug: "operador-portal-cargas",
          description: "Portal.",
        },
      ],
      permittedFlows: [
        {
          id: "portal-cargas-status",
          groupId: "group-solucoes",
          agentId: "agent-portal",
          name: "Status de Cargas",
          description: "Consulta status.",
          category: "monitoramento",
          requiresInput: false,
          inputSchema: null,
          enabled: true,
        },
      ],
      recentMessages: [
        {
          role: "assistant",
          channel: "text",
          message: "de de de de de de de <br> || texto quebrado",
          createdAt: "2026-06-29T20:00:00Z",
        },
      ],
      recentExecutions: [],
      memories: [],
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/chat", {
        method: "POST",
        body: JSON.stringify({
          message: "pode fazer um resumo",
          channel: "text",
          groupId: "group-solucoes",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(callAiProvider).not.toHaveBeenCalled();
    expect(startPortalExecution).not.toHaveBeenCalled();
    expect(payload.message).toContain("Resumo operacional do Jarbas");
    expect(payload.message).toContain("Grupo ativo: Solucoes");
    expect(payload.message).toContain("Fluxos disponiveis: Status de Cargas");
    expect(payload.message).not.toContain("<br");
    expect(payload.message).not.toContain("||");
    expect(payload.message).not.toMatch(/\bde de de de\b/i);
    expect(insertMock).toHaveBeenCalledWith([
      {
        user_id: "user-id",
        group_id: "group-solucoes",
        role: "user",
        channel: "text",
        message: "pode fazer um resumo",
      },
      {
        user_id: "user-id",
        group_id: "group-solucoes",
        role: "assistant",
        channel: "text",
        message: payload.message,
      },
    ]);
  });

  it("persists wrapup commands as structured memories", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    insertMock.mockResolvedValue({ error: null });
    vi.mocked(buildJarbasContext).mockResolvedValueOnce({
      profile: { displayName: "Cesar", email: null },
      activeGroup: { id: "group-id", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
      permittedFlows: [],
      recentMessages: [],
      recentExecutions: [],
      memories: [],
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/chat", {
        method: "POST",
        body: JSON.stringify({ message: "/wrapup", channel: "text" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.persistAsMemory).toBe(true);
    expect(saveJarbasWrapupMemory).toHaveBeenCalledWith({
      supabase: expect.anything(),
      userId: "user-id",
      groupId: "group-id",
      body: payload.message,
    });
  });
});
