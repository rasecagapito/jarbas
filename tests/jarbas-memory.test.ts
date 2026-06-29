import { describe, expect, it, vi } from "vitest";
import {
  listAccessibleJarbasMemories,
  saveJarbasWrapupMemory,
} from "@/lib/jarbas/memory";

function createQueryMock(results: Record<string, unknown[]>) {
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
        const scopeCall = [...calls]
          .filter((call) => call.table === table && call.method === "eq")
          .reverse()
          .find(
            (call: { table: string; method: string; args: unknown[] }) =>
              call.args[0] === "scope",
          );
        const key = scopeCall?.args[1] === "group" ? "group" : "user";
        return { data: results[key] ?? [], error: null };
      }),
      insert: vi.fn(async (...args: unknown[]) => {
        calls.push({ table, method: "insert", args });
        return { error: null };
      }),
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

describe("Jarbas secure memory", () => {
  it("lists personal and group memories using explicit user and group filters", async () => {
    const { calls, supabase } = createQueryMock({
      user: [
        {
          id: "memory-user",
          scope: "user",
          title: "Preferencia pessoal",
          body: "Usuario prefere resumo curto.",
          created_at: "2026-06-29T10:00:00Z",
        },
      ],
      group: [
        {
          id: "memory-group",
          scope: "group",
          title: "Padrao do grupo",
          body: "Grupo Solucoes valida Excel antes da carga.",
          created_at: "2026-06-29T11:00:00Z",
        },
      ],
    });

    const memories = await listAccessibleJarbasMemories({
      supabase,
      userId: "user-id",
      groupIds: ["group-id"],
    });

    expect(memories).toEqual([
      {
        id: "memory-user",
        scope: "user",
        title: "Preferencia pessoal",
        body: "Usuario prefere resumo curto.",
        createdAt: "2026-06-29T10:00:00Z",
      },
      {
        id: "memory-group",
        scope: "group",
        title: "Padrao do grupo",
        body: "Grupo Solucoes valida Excel antes da carga.",
        createdAt: "2026-06-29T11:00:00Z",
      },
    ]);
    expect(calls).toContainEqual({
      table: "jarbas_memories",
      method: "eq",
      args: ["scope", "user"],
    });
    expect(calls).toContainEqual({
      table: "jarbas_memories",
      method: "eq",
      args: ["user_id", "user-id"],
    });
    expect(calls).toContainEqual({
      table: "jarbas_memories",
      method: "eq",
      args: ["scope", "group"],
    });
    expect(calls).toContainEqual({
      table: "jarbas_memories",
      method: "eq",
      args: ["group_id", "group-id"],
    });
  });

  it("saves wrapup as personal memory and group memory when a group is active", async () => {
    const { calls, supabase } = createQueryMock({});

    await saveJarbasWrapupMemory({
      supabase,
      userId: "user-id",
      groupId: "group-id",
      body: "Resumo da sessao",
    });

    expect(calls).toContainEqual({
      table: "jarbas_memories",
      method: "insert",
      args: [
        [
          {
            scope: "user",
            user_id: "user-id",
            group_id: null,
            created_by: "user-id",
            source: "wrapup",
            title: "Wrapup da sessao",
            body: "Resumo da sessao",
          },
          {
            scope: "group",
            user_id: null,
            group_id: "group-id",
            created_by: "user-id",
            source: "wrapup",
            title: "Wrapup da sessao",
            body: "Resumo da sessao",
          },
        ],
      ],
    });
  });
});
