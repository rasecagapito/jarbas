export type AiProviderSlug =
  | "openai"
  | "anthropic"
  | "glm"
  | "openai_compatible";

export type AiAuthMode = "api_key" | "bearer_token" | "oauth" | "gateway";

export type AiModelRef = {
  providerSlug: AiProviderSlug;
  modelKey: string;
};

export type AiProviderAuth = {
  authMode: AiAuthMode;
  secretRef: string;
};

export type AgentAiPolicy = {
  primary: AiModelRef;
  fallback?: AiModelRef;
  temperature: number;
  maxOutputTokens: number;
};

export type ResolvedAiModelRef = AiModelRef & {
  providerEnvKey: string;
};

export type ResolvedAiModelPolicy = {
  primary: ResolvedAiModelRef;
  fallback?: ResolvedAiModelRef;
  temperature: number;
  maxOutputTokens: number;
};
