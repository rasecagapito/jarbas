import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JarbasShell } from "@/components/jarbas/jarbas-shell";

const speakMock = vi.fn();

vi.mock("@/lib/voice", () => ({
  getGreeting: (displayName: string | null | undefined) =>
    displayName ? `Ola, ${displayName}.` : "Ola.",
  isSpeechRecognitionAvailable: () => false,
  speak: (message: string) => speakMock(message),
}));

describe("JarbasShell chat", () => {
  beforeEach(() => {
    speakMock.mockClear();
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
    expect(speakMock).toHaveBeenCalledWith("Resposta real do Jarbas.");
  });

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
    expect(speakMock).toHaveBeenCalledWith(fallback);
  });
});
