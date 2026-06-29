import { describe, expect, it } from "vitest";
import { callAiProvider } from "@/lib/ai/provider";

describe("AIProvider", () => {
  it("returns a standardized successful response from the configured provider", async () => {
    const result = await callAiProvider(
      {
        messages: [
          { role: "system", content: "Voce e o Jarbas." },
          { role: "user", content: "Qual meu status?" },
        ],
        policy: {
          primary: {
            providerSlug: "openai",
            modelKey: "gpt-jarbas",
          },
          temperature: 0.2,
          maxOutputTokens: 500,
        },
        env: {
          OPENAI_API_KEY: "server-secret",
        },
      },
      async () => ({
        content: "Jarbas pronto para consultar seu status.",
        raw: { id: "provider-response-id" },
      }),
    );

    expect(result).toEqual({
      ok: true,
      content: "Jarbas pronto para consultar seu status.",
      providerSlug: "openai",
      modelKey: "gpt-jarbas",
      raw: { id: "provider-response-id" },
    });
  });

  it("returns a friendly error when the provider call fails", async () => {
    const result = await callAiProvider(
      {
        messages: [{ role: "user", content: "Resuma minha memoria." }],
        policy: {
          primary: {
            providerSlug: "anthropic",
            modelKey: "claude-jarbas",
          },
          temperature: 0.2,
          maxOutputTokens: 500,
        },
        env: {
          ANTHROPIC_API_KEY: "server-secret",
        },
      },
      async () => {
        throw new Error("provider timeout");
      },
    );

    expect(result).toEqual({
      ok: false,
      errorCode: "provider_call_failed",
      message:
        "Nao consegui acionar o motor de IA agora. Tente novamente em instantes.",
      providerSlug: "anthropic",
      modelKey: "claude-jarbas",
    });
  });

  it("rejects missing or public provider secrets before calling the provider", async () => {
    const result = await callAiProvider(
      {
        messages: [{ role: "user", content: "Ola" }],
        policy: {
          primary: {
            providerSlug: "openai",
            modelKey: "gpt-jarbas",
          },
          temperature: 0.2,
          maxOutputTokens: 500,
        },
        env: {
          NEXT_PUBLIC_OPENAI_API_KEY: "public-secret",
        },
      },
      async () => ({
        content: "this should not be called",
        raw: {},
      }),
    );

    expect(result).toEqual({
      ok: false,
      errorCode: "provider_auth_missing",
      message:
        "O motor de IA do Jarbas nao esta configurado com seguranca no backend.",
      providerSlug: "openai",
      modelKey: "gpt-jarbas",
    });
  });
});
