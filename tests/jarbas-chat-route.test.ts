import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/jarbas/chat/route";
import { callAiProvider } from "@/lib/ai/provider";
import { buildJarbasContext } from "@/lib/jarbas/context";
import { saveJarbasWrapupMemory } from "@/lib/jarbas/memory";

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
      groups: [],
      permittedAgents: [],
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
        body: JSON.stringify({ message: "Ola Jarbas", channel: "text" }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(buildJarbasContext).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-id",
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
        role: "user",
        channel: "text",
        message: "Ola Jarbas",
      },
      {
        user_id: "user-id",
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
      groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
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
        role: "user",
        channel: "text",
        message: "/status",
      },
      {
        user_id: "user-id",
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
      groups: [{ id: "group-id", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
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
