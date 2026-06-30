import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  browserVoiceProvider,
  createSpeechRecognition,
  createSpeechUtterance,
  getGreeting,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  speak,
} from "@/lib/voice";

describe("getGreeting", () => {
  it("uses display name when available", () => {
    expect(getGreeting("Cesar")).toContain("Olá, Cesar.");
  });

  it("does not invent a name when display name is missing", () => {
    expect(getGreeting(null)).toContain("Olá. Eu sou o Jarbas.");
  });
});

describe("voice feature detection", () => {
  it("returns booleans for browser capabilities", () => {
    expect(typeof isSpeechRecognitionAvailable()).toBe("boolean");
    expect(typeof isSpeechSynthesisAvailable()).toBe("boolean");
  });
});

describe("browserVoiceProvider", () => {
  const speakMock = vi.fn();
  const cancelMock = vi.fn();

  class MockSpeechSynthesisUtterance {
    text: string;
    lang = "";
    rate = 1;
    pitch = 1;
    voice: unknown = null;

    constructor(text: string) {
      this.text = text;
    }
  }

  beforeEach(() => {
    speakMock.mockClear();
    cancelMock.mockClear();
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
  });

  it("creates a pt-BR utterance and prefers more natural browser voices", () => {
    const ptVoice = { lang: "pt-BR", name: "Microsoft Maria Desktop" };
    const naturalVoice = { lang: "pt-BR", name: "Google portugues do Brasil" };
    const enVoice = { lang: "en-US", name: "English" };

    const utterance = createSpeechUtterance("Ola", [
      enVoice,
      ptVoice,
      naturalVoice,
    ]);

    expect(utterance.lang).toBe("pt-BR");
    expect(utterance.rate).toBe(0.92);
    expect(utterance.pitch).toBe(0.88);
    expect(utterance.voice).toBe(naturalVoice);
  });

  it("cancels queued speech before speaking the current Jarbas response", () => {
    vi.stubGlobal("speechSynthesis", {
      cancel: cancelMock,
      getVoices: () => [{ lang: "pt-BR", name: "Luciana" }],
      speak: speakMock,
    });

    const result = browserVoiceProvider.speak("Resposta real do Jarbas.");

    expect(result).toBe(true);
    expect(cancelMock).toHaveBeenCalledOnce();
    expect(speakMock).toHaveBeenCalledOnce();
    expect(speakMock.mock.calls[0][0]).toMatchObject({
      text: "Resposta real do Jarbas.",
      lang: "pt-BR",
      rate: 0.92,
      pitch: 0.88,
    });
  });

  it("returns false without blocking when speech synthesis is unavailable", () => {
    vi.stubGlobal("speechSynthesis", undefined);

    expect(browserVoiceProvider.speak("Sem voz")).toBe(false);
  });

  it("tries remote TTS first and falls back to browser speech when it is not configured", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        status: 204,
        ok: true,
      })),
    );
    vi.stubGlobal("speechSynthesis", {
      cancel: cancelMock,
      getVoices: () => [{ lang: "pt-BR", name: "Google portugues do Brasil" }],
      speak: speakMock,
    });

    expect(speak("Resposta com fallback.")).toBe(true);

    await vi.waitFor(() => {
      expect(speakMock).toHaveBeenCalledOnce();
    });
  });

  it("creates pt-BR speech recognition when the browser supports it", () => {
    class MockSpeechRecognition extends EventTarget {
      continuous = true;
      interimResults = true;
      lang = "";
      maxAlternatives = 0;
      onerror = null;
      onresult = null;
      onend = null;
      start = vi.fn();
      stop = vi.fn();
    }

    vi.stubGlobal("SpeechRecognition", MockSpeechRecognition);

    const recognition = createSpeechRecognition();

    expect(recognition).toMatchObject({
      continuous: false,
      interimResults: false,
      lang: "pt-BR",
      maxAlternatives: 1,
    });
  });
});
