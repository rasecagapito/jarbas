import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExecutionProgress } from "@/components/jarbas/execution-progress";

describe("ExecutionProgress", () => {
  it("renders execution progress and logs", () => {
    render(
      <ExecutionProgress
        execution={{
          id: "execution-id",
          status: "processing",
          current_step: "validating_excel",
          progress_percent: 35,
          summary: {},
        }}
        logs={[
          {
            id: "log-id",
            level: "info",
            message: "Excel recebido",
            row_number: null,
            card_code: null,
            cnpj: null,
            created_at: "2026-06-26T12:00:00Z",
          },
        ]}
      />,
    );

    expect(screen.getByText("Execucao Carga PN")).toBeTruthy();
    expect(screen.getByText("validating_excel")).toBeTruthy();
    expect(screen.getByText("35%")).toBeTruthy();
    expect(screen.getByText("[info] Excel recebido")).toBeTruthy();
  });

  it("renders nothing without execution", () => {
    const { container } = render(
      <ExecutionProgress execution={null} logs={[]} />,
    );

    expect(container.firstChild).toBeNull();
  });
});
