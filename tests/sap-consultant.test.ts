import { describe, expect, it } from "vitest";
import { answerSapQuestion } from "@/lib/sap/consultant";
import type { PortalGroup } from "@/lib/portal/types";

const groups: PortalGroup[] = [
  { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
];

describe("SAP B1 consultant worker", () => {
  it("blocks questions for groups outside the current user scope", async () => {
    const response = await answerSapQuestion({
      question: "Qual o status do pedido 123?",
      groupId: "group-fiscal",
      groups,
    });

    expect(response.usedLiveLookup).toBe(false);
    expect(response.groupScope).toEqual({
      groupId: "group-fiscal",
      allowed: false,
    });
    expect(response.answer).toContain("grupo solicitado");
  });

  it("blocks write intents because the worker is read-only in v1", async () => {
    const response = await answerSapQuestion({
      question: "Crie um parceiro de negocio para teste",
      groupId: "group-solucoes",
      groups,
    });

    expect(response.usedLiveLookup).toBe(false);
    expect(response.warnings).toContain(
      "O worker SAP B1 v1 e somente leitura e nao executa escrita no SAP.",
    );
    expect(response.answer).toContain("somente leitura");
  });

  it("answers SAP B1 questions inside the active group without exposing credentials", async () => {
    const response = await answerSapQuestion({
      question: "Como consulto um parceiro de negocio no SAP B1?",
      groupId: "group-solucoes",
      groups,
      context: { objectType: "BusinessPartners", identifier: "C20000" },
    });

    expect(response.groupScope).toEqual({
      groupId: "group-solucoes",
      groupName: "Solucoes",
      allowed: true,
    });
    expect(response.sources).toContain("SAP Business One Service Layer read-only policy");
    expect(response.answer).toContain("BusinessPartners");
    expect(JSON.stringify(response)).not.toContain("password");
  });
});
