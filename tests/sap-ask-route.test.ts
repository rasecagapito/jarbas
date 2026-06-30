import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/jarbas/sap/ask/route";
import { buildJarbasContext } from "@/lib/jarbas/context";
import { answerSapQuestion } from "@/lib/sap/consultant";

const getUserMock = vi.fn();
const supabaseMock = {
  auth: {
    getUser: getUserMock,
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseMock),
}));

vi.mock("@/lib/jarbas/context", () => ({
  buildJarbasContext: vi.fn(),
}));

vi.mock("@/lib/sap/consultant", () => ({
  answerSapQuestion: vi.fn(),
}));

describe("POST /api/jarbas/sap/ask", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await POST(
      new Request("http://localhost/api/jarbas/sap/ask", {
        method: "POST",
        body: JSON.stringify({ question: "Como consulto PN?", groupId: "group-id" }),
      }),
    );

    expect(response.status).toBe(401);
    expect(answerSapQuestion).not.toHaveBeenCalled();
  });

  it("uses Jarbas group context and delegates to the read-only SAP worker", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    vi.mocked(buildJarbasContext).mockResolvedValueOnce({
      profile: { displayName: "Cesar", email: null },
      activeGroup: { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
      groups: [{ id: "group-solucoes", name: "Solucoes", slug: "solucoes" }],
      permittedAgents: [],
      permittedFlows: [],
      recentMessages: [],
      recentExecutions: [],
      memories: [],
    });
    vi.mocked(answerSapQuestion).mockResolvedValueOnce({
      answer: "Use BusinessPartners no Service Layer.",
      sources: ["SAP Business One Service Layer read-only policy"],
      usedLiveLookup: false,
      groupScope: {
        groupId: "group-solucoes",
        groupName: "Solucoes",
        allowed: true,
      },
      warnings: [],
    });

    const response = await POST(
      new Request("http://localhost/api/jarbas/sap/ask", {
        method: "POST",
        body: JSON.stringify({
          question: "Como consulto PN?",
          groupId: "group-solucoes",
          context: { objectType: "BusinessPartners" },
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(answerSapQuestion).toHaveBeenCalledWith({
      question: "Como consulto PN?",
      groupId: "group-solucoes",
      groups: [{ id: "group-solucoes", name: "Solucoes", slug: "solucoes" }],
      context: { objectType: "BusinessPartners" },
    });
    expect(payload.answer).toContain("BusinessPartners");
  });
});
