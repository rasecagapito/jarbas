import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createElevenLabsSpeech,
  getElevenLabsConfig,
} from "@/lib/tts/elevenlabs";

describe("ElevenLabs TTS", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports missing server-side configuration without exposing secrets", () => {
    const config = getElevenLabsConfig({});

    expect(config.configured).toBe(false);
    expect(config.apiKey).toBeUndefined();
    expect(config.voiceId).toBeUndefined();
  });

  it("accepts ELEVENLABS_API as a legacy homologation alias", () => {
    const config = getElevenLabsConfig({
      ELEVENLABS_API: "server-secret",
      ELEVENLABS_VOICE_ID: "voice-123",
    });

    expect(config.configured).toBe(true);
    expect(config.apiKey).toBe("server-secret");
  });

  it("calls the ElevenLabs text-to-speech API with server-side credentials", async () => {
    const audio = new Uint8Array([1, 2, 3]).buffer;
    const fetchMock = vi.fn(async () => ({
      ok: true,
      headers: new Headers({ "content-type": "audio/mpeg" }),
      arrayBuffer: async () => audio,
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createElevenLabsSpeech({
      text: "Ola, eu sou o Jarbas.",
      env: {
        ELEVENLABS_API_KEY: "server-secret",
        ELEVENLABS_VOICE_ID: "voice-123",
      },
    });

    expect(result).toMatchObject({
      ok: true,
      contentType: "audio/mpeg",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.elevenlabs.io/v1/text-to-speech/voice-123?output_format=mp3_44100_128",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "xi-api-key": "server-secret",
        }),
      }),
    );
  });
});
