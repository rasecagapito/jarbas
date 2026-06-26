import { describe, expect, it } from "vitest";
import { JARBAS_AGENTS } from "@/lib/agents";
import { canExecuteAgent } from "@/lib/permissions";

const cargaPn = JARBAS_AGENTS[0];

describe("canExecuteAgent", () => {
  it("allows Solucoes to execute Carga PN Excel", () => {
    expect(canExecuteAgent(["solucoes"], cargaPn)).toBe(true);
  });

  it("does not allow Consultoria to execute Carga PN Excel", () => {
    expect(canExecuteAgent(["consultoria"], cargaPn)).toBe(false);
  });

  it("does not allow Administrativo to execute Carga PN Excel", () => {
    expect(canExecuteAgent(["administrativo"], cargaPn)).toBe(false);
  });
});
