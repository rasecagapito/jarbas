import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  browserVoiceProvider,
  createSpeechUtterance,
  getGreeting,
  isSpeechRecognitionAvailable,
  isSpeechSynthesisAvailable,
  speak,
} from "@/lib/voice";

describe("getGreeting", () => {
  it("uses display name when available", () => {
    expect(getGreeting("Cesar")).toContain("Ola, Cesar.");
  });

  it("does not invent a name when display name is missing", () => {
    expect(getGreeting(null)).toContain("Ola. Eu sou o Jarbas.");
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

  it("creates a pt-BR utterance with stable Jarbas voice settings", () => {
    const ptVoice = { lang: "pt-BR", name: "Microsoft Maria" };
    const enVoice = { lang: "en-US", name: "English" };

    const utterance = createSpeechUtterance("Ola", [enVoice, ptVoice]);

    expect(utterance.lang).toBe("pt-BR");
    expect(utterance.rate).toBe(0.92);
    expect(utterance.pitch).toBe(0.88);
    expect(utterance.voice).toBe(ptVoice);
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

    expect(speak("Sem voz")).toBe(false);
  });
});
