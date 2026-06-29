import type { AiProviderAuth, AiProviderSlug } from "@/lib/ai/types";

export const AI_PROVIDER_ENV_KEYS: Record<AiProviderSlug, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  glm: "GLM_API_KEY",
  gemini: "GEMINI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  llama: "LLAMA_API_KEY",
  openai_compatible: "OPENAI_COMPATIBLE_API_KEY",
};

export const AI_PROVIDER_AUTH_DEFAULTS: Record<
  AiProviderSlug,
  AiProviderAuth
> = {
  openai: { authMode: "api_key", secretRef: "OPENAI_API_KEY" },
  anthropic: { authMode: "api_key", secretRef: "ANTHROPIC_API_KEY" },
  glm: { authMode: "api_key", secretRef: "GLM_API_KEY" },
  gemini: { authMode: "api_key", secretRef: "GEMINI_API_KEY" },
  deepseek: { authMode: "api_key", secretRef: "DEEPSEEK_API_KEY" },
  llama: { authMode: "api_key", secretRef: "LLAMA_API_KEY" },
  openai_compatible: {
    authMode: "api_key",
    secretRef: "OPENAI_COMPATIBLE_API_KEY",
  },
};

export const SERVER_ONLY_AI_ENV_KEYS = Object.values(AI_PROVIDER_ENV_KEYS);
