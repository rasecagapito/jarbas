import {
  AI_PROVIDER_AUTH_DEFAULTS,
  AI_PROVIDER_ENV_KEYS,
} from "@/lib/ai/providers";
import type {
  AgentAiPolicy,
  AiModelRef,
  AiProviderAuth,
  AiProviderSlug,
  ResolvedAiModelPolicy,
  ResolvedAiModelRef,
} from "@/lib/ai/types";

export function getProviderEnvKey(providerSlug: AiProviderSlug): string {
  return AI_PROVIDER_ENV_KEYS[providerSlug];
}

export function getProviderAuthDefaults(
  providerSlug: AiProviderSlug,
): AiProviderAuth {
  return AI_PROVIDER_AUTH_DEFAULTS[providerSlug];
}

function resolveModelRef(modelRef: AiModelRef): ResolvedAiModelRef {
  return {
    ...modelRef,
    providerEnvKey: getProviderEnvKey(modelRef.providerSlug),
  };
}

export function resolveAiModelPolicy(
  policy: AgentAiPolicy,
): ResolvedAiModelPolicy {
  return {
    primary: resolveModelRef(policy.primary),
    fallback: policy.fallback ? resolveModelRef(policy.fallback) : undefined,
    temperature: policy.temperature,
    maxOutputTokens: policy.maxOutputTokens,
  };
}
