const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2";
const DEFAULT_OUTPUT_FORMAT = "mp3_44100_128";
const MAX_TTS_TEXT_LENGTH = 2500;

type ElevenLabsTtsInput = {
  text: string;
  env?: Record<string, string | undefined>;
};

type ElevenLabsTtsResult =
  | {
      ok: true;
      audio: ArrayBuffer;
      contentType: string;
    }
  | {
      ok: false;
      status: "not_configured" | "invalid_text" | "provider_failed";
    };

function getEnvValue(
  env: Record<string, string | undefined>,
  name: string,
): string | undefined {
  const value = env[name]?.trim();
  return value ? value : undefined;
}

export function getElevenLabsConfig(
  env: Record<string, string | undefined> = process.env,
) {
  const apiKey =
    getEnvValue(env, "ELEVENLABS_API_KEY") ?? getEnvValue(env, "ELEVENLABS_API");
  const voiceId = getEnvValue(env, "ELEVENLABS_VOICE_ID");
  const modelId =
    getEnvValue(env, "ELEVENLABS_MODEL_ID") ?? DEFAULT_ELEVENLABS_MODEL;
  const outputFormat =
    getEnvValue(env, "ELEVENLABS_OUTPUT_FORMAT") ?? DEFAULT_OUTPUT_FORMAT;

  return {
    apiKey,
    voiceId,
    modelId,
    outputFormat,
    configured: Boolean(apiKey && voiceId),
  };
}

export async function createElevenLabsSpeech({
  text,
  env = process.env,
}: ElevenLabsTtsInput): Promise<ElevenLabsTtsResult> {
  const trimmedText = text.trim();

  if (!trimmedText) {
    return { ok: false, status: "invalid_text" };
  }

  const config = getElevenLabsConfig(env);

  if (!config.configured || !config.apiKey || !config.voiceId) {
    return { ok: false, status: "not_configured" };
  }

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${config.voiceId}?output_format=${config.outputFormat}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": config.apiKey,
      },
      body: JSON.stringify({
        text: trimmedText.slice(0, MAX_TTS_TEXT_LENGTH),
        model_id: config.modelId,
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (!response.ok) {
    return { ok: false, status: "provider_failed" };
  }

  return {
    ok: true,
    audio: await response.arrayBuffer(),
    contentType: response.headers.get("content-type") ?? "audio/mpeg",
  };
}
