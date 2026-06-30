import { describe, expect, it } from "vitest";
import { JARBAS_AGENTS } from "@/lib/agents";

describe("JARBAS_AGENTS", () => {
  it("defines the portal operator, SAP consultant and legacy Carga PN agents", () => {
    expect(JARBAS_AGENTS).toContainEqual({
      slug: "operador-portal-cargas",
      name: "Operador Portal de Cargas",
      workflowId: "contract-portal-adapter",
      groupSlug: "solucoes",
    });
    expect(JARBAS_AGENTS).toContainEqual({
      slug: "consultor-sap-b1",
      name: "Consultor SAP B1",
      workflowId: "sap-b1-readonly-consultant",
      groupSlug: "solucoes",
    });
    expect(JARBAS_AGENTS).toContainEqual({
      slug: "carga-pn-excel",
      name: "Carga PN Excel",
      workflowId: "AfhcrI8P35wY0SV7",
      groupSlug: "solucoes",
    });
  });
});
