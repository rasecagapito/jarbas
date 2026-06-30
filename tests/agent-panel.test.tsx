import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AgentPanel } from "@/components/jarbas/agent-panel";

describe("AgentPanel", () => {
  it("renders active group controls and group-scoped flows", async () => {
    const onActiveGroupChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AgentPanel
        activeGroupId="group-solucoes"
        flows={[
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
          {
            id: "fluxo-fiscal",
            groupId: "group-fiscal",
            agentId: "agent-fiscal",
            name: "Fluxo Fiscal",
            description: "Nao deve aparecer no grupo Solucoes.",
            category: "fiscal",
            requiresInput: false,
            inputSchema: null,
            enabled: true,
          },
        ]}
        groups={[
          { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
          { id: "group-fiscal", name: "Fiscal", slug: "fiscal" },
        ]}
        onActiveGroupChange={onActiveGroupChange}
      />,
    );

    expect(screen.getByText("Grupo Solucoes")).toBeInTheDocument();
    expect(screen.getByText("Operador Portal de Cargas")).toBeInTheDocument();
    expect(screen.getByText("Consultor SAP B1")).toBeInTheDocument();
    expect(screen.getByText("Status de Cargas")).toBeInTheDocument();
    expect(screen.queryByText("Fluxo Fiscal")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fiscal" }));

    expect(onActiveGroupChange).toHaveBeenCalledWith("group-fiscal");
  });
});
