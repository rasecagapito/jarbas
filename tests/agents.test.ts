import { describe, expect, it } from "vitest";
import { JARBAS_AGENTS } from "@/lib/agents";

describe("JARBAS_AGENTS", () => {
  it("defines the initial Carga PN Excel agent", () => {
    expect(JARBAS_AGENTS).toContainEqual({
      slug: "carga-pn-excel",
      name: "Carga PN Excel",
      workflowId: "AfhcrI8P35wY0SV7",
      groupSlug: "solucoes",
    });
  });
});
