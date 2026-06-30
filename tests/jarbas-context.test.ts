import { describe, expect, it, vi } from "vitest";
import {
  buildJarbasContext,
  createJarbasSystemPrompt,
} from "@/lib/jarbas/context";

function createQueryMock(results: Record<string, unknown>) {
  const calls: Array<{ table: string; method: string; args: unknown[] }> = [];

  function createBuilder(table: string) {
    const builder = {
      select: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "select", args });
        return builder;
      }),
      eq: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "eq", args });
        return builder;
      }),
      order: vi.fn((...args: unknown[]) => {
        calls.push({ table, method: "order", args });
        return builder;
      }),
      limit: vi.fn(async (...args: unknown[]) => {
        calls.push({ table, method: "limit", args });
        return { data: results[table] ?? [], error: null };
      }),
      maybeSingle: vi.fn(async () => ({
        data: results[table] ?? null,
        error: null,
      })),
    };

    return builder;
  }

  return {
    calls,
    supabase: {
      from: (table: string) => createBuilder(table),
    },
  };
}

describe("Jarbas context builder", () => {
  it("loads profile, groups, permitted agents, recent conversations and executions for the current user", async () => {
    const { calls, supabase } = createQueryMock({
      profiles: {
        display_name: "Cesar",
        email: "cesar@example.com",
      },
      user_groups: [
        {
          groups: {
            id: "group-id",
            name: "Solucoes",
            slug: "solucoes",
          },
        },
      ],
      agent_permissions: [
        {
          agents: {
            id: "agent-portal",
            name: "Operador Portal de Cargas",
            slug: "operador-portal-cargas",
            description: "Opera fluxos do portal externo.",
          },
        },
        {
          agents: {
            id: "agent-id",
            name: "Carga PN Excel",
            slug: "carga-pn-excel",
            description: "Executa carga PN via Excel.",
          },
        },
      ],
      conversation_history: [
        {
          role: "user",
          channel: "text",
          message: "Quero retomar a carga.",
          created_at: "2026-06-29T10:00:00Z",
        },
      ],
      jarbas_executions: [
        {
          id: "execution-id",
          group_id: "group-id",
          status: "processing",
          current_step: "validando Excel",
          progress_percent: 35,
          created_at: "2026-06-29T10:01:00Z",
        },
      ],
      jarbas_memories: [
        {
          id: "memory-id",
          scope: "user",
          title: "Preferencia",
          body: "Usuario prefere respostas curtas.",
          created_at: "2026-06-29T10:02:00Z",
        },
      ],
    });

    const context = await buildJarbasContext({
      supabase,
      userId: "user-id",
      activeGroupId: "group-id",
    });

    expect(context.profile.displayName).toBe("Cesar");
    expect(context.activeGroup).toEqual({
      id: "group-id",
      name: "Solucoes",
      slug: "solucoes",
    });
    expect(context.groups).toEqual([
      {
        id: "group-id",
        name: "Solucoes",
        slug: "solucoes",
      },
    ]);
    expect(context.permittedAgents).toEqual([
      {
        id: "agent-portal",
        name: "Operador Portal de Cargas",
        slug: "operador-portal-cargas",
        description: "Opera fluxos do portal externo.",
      },
      {
        id: "agent-id",
        name: "Carga PN Excel",
        slug: "carga-pn-excel",
        description: "Executa carga PN via Excel.",
      },
    ]);
    expect(context.permittedFlows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "portal-cargas-status",
          groupId: "group-id",
          agentId: "agent-portal",
        }),
        expect.objectContaining({
          id: "carga-pn-excel",
          groupId: "group-id",
          agentId: "agent-id",
        }),
      ]),
    );
    expect(context.recentMessages).toHaveLength(1);
    expect(context.recentExecutions).toEqual([
      expect.objectContaining({
        id: "execution-id",
        groupId: "group-id",
      }),
    ]);
    expect(context.memories).toEqual([
      {
        id: "memory-id",
        scope: "user",
        title: "Preferencia",
        body: "Usuario prefere respostas curtas.",
        createdAt: "2026-06-29T10:02:00Z",
      },
    ]);
    expect(calls).toContainEqual({
      table: "profiles",
      method: "eq",
      args: ["user_id", "user-id"],
    });
    expect(calls).toContainEqual({
      table: "conversation_history",
      method: "eq",
      args: ["user_id", "user-id"],
    });
    expect(calls).toContainEqual({
      table: "conversation_history",
      method: "eq",
      args: ["group_id", "group-id"],
    });
    expect(calls).toContainEqual({
      table: "jarbas_executions",
      method: "eq",
      args: ["user_id", "user-id"],
    });
    expect(calls).toContainEqual({
      table: "jarbas_executions",
      method: "eq",
      args: ["group_id", "group-id"],
    });
    expect(calls).toContainEqual({
      table: "agent_permissions",
      method: "eq",
      args: ["group_id", "group-id"],
    });
  });

  it("falls back to the first allowed group when the requested active group is not accessible", async () => {
    const { calls, supabase } = createQueryMock({
      profiles: null,
      user_groups: [
        {
          groups: {
            id: "group-solucoes",
            name: "Solucoes",
            slug: "solucoes",
          },
        },
      ],
      agent_permissions: [],
      conversation_history: [],
      jarbas_executions: [],
      jarbas_memories: [],
    });

    const context = await buildJarbasContext({
      supabase,
      userId: "user-id",
      activeGroupId: "group-fiscal",
    });

    expect(context.activeGroup).toEqual({
      id: "group-solucoes",
      name: "Solucoes",
      slug: "solucoes",
    });
    expect(calls).toContainEqual({
      table: "agent_permissions",
      method: "eq",
      args: ["group_id", "group-solucoes"],
    });
  });

  it("creates a system prompt with safe context and anti-hallucination guidance", () => {
    const prompt = createJarbasSystemPrompt({
      profile: {
        displayName: "Cesar",
        email: "cesar@example.com",
      },
      activeGroup: { id: "group-id", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [
        {
          id: "agent-id",
          name: "Carga PN Excel",
          slug: "carga-pn-excel",
          description: "Executa carga PN via Excel.",
        },
      ],
      permittedFlows: [
        {
          id: "carga-pn-excel",
          groupId: "group-id",
          agentId: "agent-id",
          name: "Carga PN Excel",
          description: "Fluxo legado.",
          category: "cadastro",
          requiresInput: true,
          inputSchema: null,
          enabled: true,
        },
      ],
      recentMessages: [],
      recentExecutions: [],
      memories: [
        {
          id: "memory-id",
          scope: "user",
          title: "Preferencia",
          body: "Usuario prefere respostas curtas.",
          createdAt: "2026-06-29T10:02:00Z",
        },
      ],
    });

    expect(prompt).toContain("Usuario: Cesar");
    expect(prompt).toContain("Grupos ativos: Solucoes");
    expect(prompt).toContain("Agentes permitidos: Carga PN Excel");
    expect(prompt).toContain("Fluxos permitidos: Carga PN Excel");
    expect(prompt).toContain("Memorias estruturadas: Preferencia: Usuario prefere respostas curtas.");
    expect(prompt).toContain("Nunca use memoria, execucao, fluxo ou regra de outro grupo");
    expect(prompt).toContain("Nao invente nome, grupo, memoria, historico");
  });
});
