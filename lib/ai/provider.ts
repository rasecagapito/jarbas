import { getProviderEnvKey } from "@/lib/ai/router";
import type {
  AiProviderEnv,
  AiProviderFailure,
  AiProviderInput,
  AiProviderResult,
  AiProviderTransportInput,
  AiProviderTransportResult,
  AiProviderSuccess,
  AiProviderTransport,
} from "@/lib/ai/types";

const PROVIDER_AUTH_MISSING_MESSAGE =
  "O motor de IA do Jarbas nao esta configurado com seguranca no backend.";

const PROVIDER_CALL_FAILED_MESSAGE =
  "Nao consegui acionar o motor de IA agora. Tente novamente em instantes.";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

function getServerSecret(env: AiProviderEnv, secretRef: string) {
  if (secretRef.startsWith("NEXT_PUBLIC_")) return undefined;

  const secret = env[secretRef]?.trim();
  return secret ? secret : undefined;
}

function getEnvValue(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function resolveModelKey(modelKey: string, envName: string) {
  if (modelKey !== "default-chat") return modelKey;

  return getEnvValue("JARBAS_AI_MODEL") ?? getEnvValue(envName) ?? "gpt-4o-mini";
}

function resolveOpenAiCompatibleConfig(
  input: AiProviderTransportInput,
): { baseUrl: string; model: string } {
  switch (input.providerSlug) {
    case "openai":
      return {
        baseUrl: normalizeBaseUrl(
          getEnvValue("OPENAI_BASE_URL") ?? "https://api.openai.com/v1",
        ),
        model: resolveModelKey(input.modelKey, "OPENAI_MODEL"),
      };
    case "deepseek":
      return {
        baseUrl: normalizeBaseUrl(
          getEnvValue("DEEPSEEK_BASE_URL") ?? "https://api.deepseek.com/v1",
        ),
        model: resolveModelKey(input.modelKey, "DEEPSEEK_MODEL"),
      };
    case "glm":
      return {
        baseUrl: normalizeBaseUrl(
          getEnvValue("GLM_BASE_URL") ?? "https://open.bigmodel.cn/api/paas/v4",
        ),
        model: resolveModelKey(input.modelKey, "GLM_MODEL"),
      };
    case "llama":
      return {
        baseUrl: normalizeBaseUrl(getEnvValue("LLAMA_BASE_URL") ?? ""),
        model: resolveModelKey(input.modelKey, "LLAMA_MODEL"),
      };
    case "openai_compatible":
      return {
        baseUrl: normalizeBaseUrl(
          getEnvValue("OPENAI_COMPATIBLE_BASE_URL") ?? "",
        ),
        model: resolveModelKey(input.modelKey, "OPENAI_COMPATIBLE_MODEL"),
      };
    default:
      throw new Error(`Provider ${input.providerSlug} is not supported yet`);
  }
}

function createProviderHeaders(input: AiProviderTransportInput) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${input.apiKey}`,
    "Content-Type": "application/json",
  };

  if (input.providerSlug === "openai" && getEnvValue("OPENAI_BASE_URL")?.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = getEnvValue("OPENROUTER_SITE_URL") ?? "http://localhost:3000";
    headers["X-Title"] = getEnvValue("OPENROUTER_APP_NAME") ?? "Jarbas HOM";
  }

  return headers;
}

function providerFailure(
  input: AiProviderInput,
  errorCode: AiProviderFailure["errorCode"],
  message: string,
): AiProviderFailure {
  return {
    ok: false,
    errorCode,
    message,
    providerSlug: input.policy.primary.providerSlug,
    modelKey: input.policy.primary.modelKey,
  };
}

function providerSuccess(
  input: AiProviderInput,
  content: string,
  raw: unknown,
): AiProviderSuccess {
  return {
    ok: true,
    content,
    providerSlug: input.policy.primary.providerSlug,
    modelKey: input.policy.primary.modelKey,
    raw,
  };
}

async function callModel(
  baseUrl: string,
  model: string,
  input: AiProviderTransportInput,
): Promise<AiProviderTransportResult> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: createProviderHeaders(input),
    body: JSON.stringify({
      model,
      messages: input.messages,
      temperature: input.temperature,
      max_tokens: input.maxOutputTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider returned ${response.status} for ${model}`);
  }

  const raw = (await response.json()) as ChatCompletionResponse;
  const content = sanitizeContent(raw.choices?.[0]?.message?.content);

  if (!content) {
    throw new Error(`AI provider returned an empty response for ${model}`);
  }

  return { content, raw };
}

// Alguns modelos (ex.: Gemma free) vazam tokens especiais no texto.
function sanitizeContent(content: string | null | undefined): string {
  return (content ?? "")
    .replace(/<\/?(pad|s|eos|bos|unk)>/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

async function defaultAiProviderTransport(
  input: AiProviderTransportInput,
): Promise<AiProviderTransportResult> {
  const { baseUrl, model } = resolveOpenAiCompatibleConfig(input);

  if (!baseUrl) {
    throw new Error(`Base URL is not configured for ${input.providerSlug}`);
  }

  // OPENAI_MODEL pode listar varios modelos separados por virgula.
  // Tenta cada um em ordem ate obter resposta (resiliencia a 429 de modelos free).
  const models = model
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  let lastError: unknown;

  for (const candidate of models) {
    try {
      return await callModel(baseUrl, candidate, input);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError ?? new Error("No AI model candidates configured");
}

export async function callAiProvider(
  input: AiProviderInput,
  transport: AiProviderTransport = defaultAiProviderTransport,
): Promise<AiProviderResult> {
  const secretRef = getProviderEnvKey(input.policy.primary.providerSlug);
  const apiKey = getServerSecret(input.env ?? process.env, secretRef);

  if (!apiKey) {
    return providerFailure(
      input,
      "provider_auth_missing",
      PROVIDER_AUTH_MISSING_MESSAGE,
    );
  }

  try {
    const result = await transport({
      messages: input.messages,
      modelKey: input.policy.primary.modelKey,
      providerSlug: input.policy.primary.providerSlug,
      apiKey,
      temperature: input.policy.temperature,
      maxOutputTokens: input.policy.maxOutputTokens,
    });

    return providerSuccess(input, result.content, result.raw);
  } catch {
    return providerFailure(
      input,
      "provider_call_failed",
      PROVIDER_CALL_FAILED_MESSAGE,
    );
  }
}
