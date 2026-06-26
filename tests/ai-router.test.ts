import { describe, expect, it } from "vitest";
import {
  getProviderAuthDefaults,
  getProviderEnvKey,
  resolveAiModelPolicy,
} from "@/lib/ai/router";
import { SERVER_ONLY_AI_ENV_KEYS } from "@/lib/ai/providers";

describe("AI Router", () => {
  it("maps providers to backend-only env vars", () => {
    expect(getProviderEnvKey("openai")).toBe("OPENAI_API_KEY");
    expect(getProviderEnvKey("anthropic")).toBe("ANTHROPIC_API_KEY");
    expect(getProviderEnvKey("glm")).toBe("GLM_API_KEY");
    expect(getProviderEnvKey("openai_compatible")).toBe(
      "OPENAI_COMPATIBLE_API_KEY",
    );
  });

  it("keeps provider auth configurable by provider", () => {
    expect(getProviderAuthDefaults("openai")).toEqual({
      authMode: "api_key",
      secretRef: "OPENAI_API_KEY",
    });
    expect(getProviderAuthDefaults("anthropic")).toEqual({
      authMode: "api_key",
      secretRef: "ANTHROPIC_API_KEY",
    });
  });

  it("resolves primary model and fallback model from policy", () => {
    const resolved = resolveAiModelPolicy({
      primary: {
        providerSlug: "openai",
        modelKey: "gpt-default",
      },
      fallback: {
        providerSlug: "anthropic",
        modelKey: "claude-default",
      },
      temperature: 0.2,
      maxOutputTokens: 1000,
    });

    expect(resolved.primary.providerEnvKey).toBe("OPENAI_API_KEY");
    expect(resolved.fallback?.providerEnvKey).toBe("ANTHROPIC_API_KEY");
    expect(resolved.temperature).toBe(0.2);
    expect(resolved.maxOutputTokens).toBe(1000);
  });

  it("does not expose provider secrets through NEXT_PUBLIC variables", () => {
    expect(SERVER_ONLY_AI_ENV_KEYS).not.toContainEqual(
      expect.stringMatching(/^NEXT_PUBLIC_/),
    );
  });
});
