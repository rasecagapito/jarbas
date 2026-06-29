export type AiProviderSlug =
  | "openai"
  | "anthropic"
  | "glm"
  | "gemini"
  | "deepseek"
  | "llama"
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

export type AiMessageRole = "system" | "user" | "assistant";

export type AiMessage = {
  role: AiMessageRole;
  content: string;
};

export type AiProviderEnv = Record<string, string | undefined>;

export type AiProviderInput = {
  messages: AiMessage[];
  policy: AgentAiPolicy;
  env?: AiProviderEnv;
};

export type AiProviderTransportInput = {
  messages: AiMessage[];
  modelKey: string;
  providerSlug: AiProviderSlug;
  apiKey: string;
  temperature: number;
  maxOutputTokens: number;
};

export type AiProviderTransportResult = {
  content: string;
  raw?: unknown;
};

export type AiProviderSuccess = {
  ok: true;
  content: string;
  providerSlug: AiProviderSlug;
  modelKey: string;
  raw?: unknown;
};

export type AiProviderFailure = {
  ok: false;
  errorCode: "provider_auth_missing" | "provider_call_failed";
  message: string;
  providerSlug: AiProviderSlug;
  modelKey: string;
};

export type AiProviderResult = AiProviderSuccess | AiProviderFailure;

export type AiProviderTransport = (
  input: AiProviderTransportInput,
) => Promise<AiProviderTransportResult>;
