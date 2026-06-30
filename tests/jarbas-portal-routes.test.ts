import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getFlows } from "@/app/api/jarbas/portal/flows/route";
import {
  GET as listExecutions,
  POST as startExecution,
} from "@/app/api/jarbas/portal/executions/route";
import { GET as getExecution } from "@/app/api/jarbas/portal/executions/[id]/route";
import {
  getPortalExecution,
  listPortalExecutions,
  listPortalFlows,
  startPortalExecution,
} from "@/lib/portal/gateway";

const getUserMock = vi.fn();
const supabaseMock = {
  auth: {
    getUser: getUserMock,
  },
};

vi.mock("@/lib/supabase/server", () => ({
  createServerSupabaseClient: vi.fn(async () => supabaseMock),
}));

vi.mock("@/lib/portal/gateway", () => ({
  getPortalExecution: vi.fn(),
  listPortalExecutions: vi.fn(),
  listPortalFlows: vi.fn(),
  startPortalExecution: vi.fn(),
}));

describe("Jarbas portal API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires authentication to list portal flows", async () => {
    getUserMock.mockResolvedValueOnce({ data: { user: null }, error: null });

    const response = await getFlows();

    expect(response.status).toBe(401);
    expect(listPortalFlows).not.toHaveBeenCalled();
  });

  it("returns only flows resolved by the group-aware gateway", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    vi.mocked(listPortalFlows).mockResolvedValueOnce([
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
    ]);

    const response = await getFlows();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(listPortalFlows).toHaveBeenCalledWith({
      supabase: supabaseMock,
      userId: "user-id",
    });
    expect(payload.flows).toHaveLength(1);
  });

  it("starts portal executions only through the gateway", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    vi.mocked(startPortalExecution).mockResolvedValueOnce({
      ok: true,
      execution: {
        id: "execution-id",
        groupId: "group-solucoes",
        flowId: "portal-cargas-status",
        flowName: "Status de Cargas",
        status: "processing",
        currentStep: "fluxo iniciado",
        progressPercent: 10,
        summary: {},
        createdAt: "2026-06-29T20:00:00Z",
      },
    });

    const response = await startExecution(
      new Request("http://localhost/api/jarbas/portal/executions", {
        method: "POST",
        body: JSON.stringify({
          flowId: "portal-cargas-status",
          groupId: "group-solucoes",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(startPortalExecution).toHaveBeenCalledWith({
      supabase: supabaseMock,
      userId: "user-id",
      request: {
        flowId: "portal-cargas-status",
        groupId: "group-solucoes",
      },
    });
    expect(payload.execution.id).toBe("execution-id");
  });

  it("returns gateway errors with their safe status", async () => {
    getUserMock.mockResolvedValueOnce({
      data: { user: { id: "user-id" } },
      error: null,
    });
    vi.mocked(startPortalExecution).mockResolvedValueOnce({
      ok: false,
      status: 403,
      error: "flow_not_allowed_for_group",
    });

    const response = await startExecution(
      new Request("http://localhost/api/jarbas/portal/executions", {
        method: "POST",
        body: JSON.stringify({
          flowId: "portal-cargas-status",
          groupId: "group-fiscal",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload).toEqual({ error: "flow_not_allowed_for_group" });
  });

  it("lists and gets executions through group-aware gateway functions", async () => {
    getUserMock
      .mockResolvedValueOnce({ data: { user: { id: "user-id" } }, error: null })
      .mockResolvedValueOnce({ data: { user: { id: "user-id" } }, error: null });
    vi.mocked(listPortalExecutions).mockResolvedValueOnce([]);
    vi.mocked(getPortalExecution).mockResolvedValueOnce({
      ok: false,
      status: 404,
      error: "execution_not_found",
    });

    const listResponse = await listExecutions(
      new Request("http://localhost/api/jarbas/portal/executions?groupId=group-solucoes"),
    );
    const getResponse = await getExecution(new Request("http://localhost"), {
      params: Promise.resolve({ id: "execution-id" }),
    });

    expect(listResponse.status).toBe(200);
    expect(listPortalExecutions).toHaveBeenCalledWith({
      supabase: supabaseMock,
      userId: "user-id",
      groupId: "group-solucoes",
    });
    expect(getResponse.status).toBe(404);
    expect(getPortalExecution).toHaveBeenCalledWith({
      supabase: supabaseMock,
      userId: "user-id",
      executionId: "execution-id",
    });
  });
});
