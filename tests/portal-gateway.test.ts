import { describe, expect, it } from "vitest";
import {
  findAccessiblePortalFlow,
  listPortalFlowsForContext,
  mapPortalExecutionRow,
} from "@/lib/portal/gateway";
import type { PortalAgent, PortalGroup } from "@/lib/portal/types";

const groups: PortalGroup[] = [
  { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
  { id: "group-fiscal", name: "Fiscal", slug: "fiscal" },
];

const permittedAgents: PortalAgent[] = [
  {
    id: "agent-portal",
    name: "Operador Portal de Cargas",
    slug: "operador-portal-cargas",
    description: "Opera fluxos do portal externo.",
  },
  {
    id: "agent-carga",
    name: "Carga PN Excel",
    slug: "carga-pn-excel",
    description: "Fluxo legado de carga PN.",
  },
];

describe("PortalGateway contract adapter", () => {
  it("lists only portal flows allowed by the user groups and agent permissions", () => {
    const flows = listPortalFlowsForContext({ groups, permittedAgents });

    expect(flows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "portal-cargas-status",
          groupId: "group-solucoes",
          agentId: "agent-portal",
          name: "Status de Cargas",
          enabled: true,
        }),
        expect.objectContaining({
          id: "carga-pn-excel",
          groupId: "group-solucoes",
          agentId: "agent-carga",
          name: "Carga PN Excel",
          enabled: true,
        }),
      ]),
    );
    expect(flows.every((flow) => flow.groupId === "group-solucoes")).toBe(true);
  });

  it("does not return a flow when the requested group is not accessible", () => {
    const flow = findAccessiblePortalFlow({
      flowId: "portal-cargas-status",
      groupId: "group-fiscal",
      groups,
      permittedAgents,
    });

    expect(flow).toBeNull();
  });

  it("maps execution rows to the public portal execution contract", () => {
    expect(
      mapPortalExecutionRow({
        id: "execution-id",
        group_id: "group-solucoes",
        workflow_id: "contract:portal-cargas-status",
        status: "processing",
        current_step: "consultando portal externo",
        progress_percent: 45,
        summary: { flowId: "portal-cargas-status", flowName: "Status de Cargas" },
        created_at: "2026-06-29T20:00:00Z",
      }),
    ).toEqual({
      id: "execution-id",
      groupId: "group-solucoes",
      flowId: "portal-cargas-status",
      flowName: "Status de Cargas",
      status: "processing",
      currentStep: "consultando portal externo",
      progressPercent: 45,
      summary: { flowId: "portal-cargas-status", flowName: "Status de Cargas" },
      createdAt: "2026-06-29T20:00:00Z",
    });
  });
});
