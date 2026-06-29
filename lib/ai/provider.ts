import { getProviderEnvKey } from "@/lib/ai/router";
import type {
  AiProviderEnv,
  AiProviderFailure,
  AiProviderInput,
  AiProviderResult,
  AiProviderTransportResult,
  AiProviderSuccess,
  AiProviderTransport,
} from "@/lib/ai/types";

const PROVIDER_AUTH_MISSING_MESSAGE =
  "O motor de IA do Jarbas nao esta configurado com seguranca no backend.";

const PROVIDER_CALL_FAILED_MESSAGE =
  "Nao consegui acionar o motor de IA agora. Tente novamente em instantes.";

function getServerSecret(env: AiProviderEnv, secretRef: string) {
  if (secretRef.startsWith("NEXT_PUBLIC_")) return undefined;

  const secret = env[secretRef]?.trim();
  return secret ? secret : undefined;
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

async function defaultAiProviderTransport(): Promise<AiProviderTransportResult> {
  throw new Error("AI provider transport is not configured");
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
