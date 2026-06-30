import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JarbasShell } from "@/components/jarbas/jarbas-shell";

const speakMock = vi.fn();
let speechAvailable = false;
let voiceEnabled = false;
let recognitionInstance: {
  onresult: ((event: {
    results: Array<Array<{ transcript: string }>>;
  }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: ReturnType<typeof vi.fn>;
} | null = null;

vi.mock("@/lib/voice", () => ({
  createSpeechRecognition: () => {
    recognitionInstance = {
      onresult: null,
      onerror: null,
      onend: null,
      start: vi.fn(),
    };

    return recognitionInstance;
  },
  getGreeting: (displayName: string | null | undefined) =>
    displayName ? `Ola, ${displayName}.` : "Ola.",
  isSpeechRecognitionAvailable: () => speechAvailable,
  isJarbasVoiceEnabled: () => voiceEnabled,
  speak: (message: string) => speakMock(message),
}));

describe("JarbasShell chat", () => {
  beforeEach(() => {
    speakMock.mockClear();
    speechAvailable = false;
    voiceEnabled = false;
    recognitionInstance = null;
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({ message: "Resposta real do Jarbas." }),
      })),
    );
  });

  it("sends text messages to the backend and renders the Jarbas response", async () => {
    const user = userEvent.setup();

    render(<JarbasShell displayName="Cesar" signOutAction={async () => {}} />);

    await user.type(
      screen.getByLabelText("Instrucao para o Jarbas"),
      "Qual meu status?",
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(fetch).toHaveBeenCalledWith("/api/jarbas/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Qual meu status?",
        channel: "text",
      }),
    });
    expect(await screen.findByText("Resposta real do Jarbas.")).toBeInTheDocument();
    expect(speakMock).not.toHaveBeenCalled();
  }, 10000);

  it("keeps voice disabled by default for the written conversation stage", async () => {
    const user = userEvent.setup();

    render(<JarbasShell displayName="Cesar" signOutAction={async () => {}} />);

    expect(screen.queryByRole("button", { name: "Ativar voz" })).not.toBeInTheDocument();
    expect(speakMock).not.toHaveBeenCalled();

    await user.type(
      screen.getByLabelText("Instrucao para o Jarbas"),
      "Pode fazer um resumo?",
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByText("Resposta real do Jarbas.")).toBeInTheDocument();
    expect(speakMock).not.toHaveBeenCalled();
  }, 10000);

  it("sends the active group to the backend when a group is selected", async () => {
    const user = userEvent.setup();

    render(
      <JarbasShell
        displayName="Cesar"
        initialGroups={[
          { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
        ]}
        signOutAction={async () => {}}
      />,
    );

    await user.type(
      screen.getByLabelText("Instrucao para o Jarbas"),
      "Qual meu status?",
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(fetch).toHaveBeenCalledWith("/api/jarbas/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Qual meu status?",
        channel: "text",
        groupId: "group-solucoes",
      }),
    });
  }, 10000);

  it("polls the portal execution endpoint after a portal chat action starts an execution", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url === "/api/jarbas/portal/flows") {
        return {
          ok: true,
          json: async () => ({ flows: [] }),
        };
      }

      if (url === "/api/jarbas/chat") {
        return {
          ok: true,
          json: async () => ({
            message: "Fluxo de portal iniciado.",
            portal: {
              execution: {
                id: "portal-execution-id",
              },
            },
          }),
        };
      }

      if (url === "/api/jarbas/portal/executions/portal-execution-id") {
        return {
          ok: true,
          json: async () => ({
            execution: {
              id: "portal-execution-id",
              groupId: "group-solucoes",
              flowId: "portal-cargas-iniciar-fluxo",
              flowName: "Iniciar Fluxo de Cargas",
              status: "processing",
              currentStep: "fluxo solicitado ao adapter de contrato",
              progressPercent: 10,
              summary: {},
              createdAt: "2026-06-29T20:00:00Z",
            },
          }),
        };
      }

      throw new Error(`Unexpected fetch ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    render(
      <JarbasShell
        displayName="Cesar"
        initialGroups={[
          { id: "group-solucoes", name: "Solucoes", slug: "solucoes" },
        ]}
        pollIntervalMs={10}
        signOutAction={async () => {}}
      />,
    );

    await user.type(
      screen.getByLabelText("Instrucao para o Jarbas"),
      "Iniciar processamento no portal",
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(await screen.findByText("Fluxo de portal iniciado.")).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/jarbas/portal/executions/portal-execution-id",
      );
    });
  }, 10000);

  it("renders and speaks a friendly message when the backend is unreachable", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );

    render(<JarbasShell displayName="Cesar" signOutAction={async () => {}} />);

    await user.type(
      screen.getByLabelText("Instrucao para o Jarbas"),
      "Ola?",
    );
    await user.click(screen.getByRole("button", { name: "Enviar" }));

    const fallback =
      "Nao consegui me comunicar com o cerebro do Jarbas agora. Tente novamente em instantes.";

    expect(await screen.findByText(fallback)).toBeInTheDocument();
    expect(speakMock).not.toHaveBeenCalled();
  });

  it("sends recognized voice messages to the backend voice channel", async () => {
    voiceEnabled = true;
    speechAvailable = true;
    const user = userEvent.setup();

    render(<JarbasShell displayName="Cesar" signOutAction={async () => {}} />);

    await user.click(screen.getByRole("button", { name: "Ativar voz" }));
    recognitionInstance?.onresult?.({
      results: [[{ transcript: "Qual meu status por voz?" }]],
    });

    expect(fetch).toHaveBeenCalledWith("/api/jarbas/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Qual meu status por voz?",
        channel: "voice",
      }),
    });
    expect(await screen.findByText("Resposta real do Jarbas.")).toBeInTheDocument();
  });
});
