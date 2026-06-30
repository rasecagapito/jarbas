type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

export type VoiceProvider = {
  speak: (text: string) => boolean;
};

type SpeechRecognitionAlternative = {
  transcript: string;
};

type SpeechRecognitionResult = {
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognition = EventTarget & {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognition;

export function isJarbasVoiceEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env.NEXT_PUBLIC_JARBAS_VOICE_ENABLED === "true";
}

export function getGreeting(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  const context =
    "Eu sou o Jarbas. Como está seu dia? Espero que bem! Qual atividade deseja executar hoje? Quer algo específico ou prefere que eu faça um resumo dos nossos últimos assuntos?";

  if (trimmed) {
    return `Olá, ${trimmed}. ${context}`;
  }

  return `Olá. ${context}`;
}

export function isSpeechRecognitionAvailable(): boolean {
  if (typeof window === "undefined") return false;

  const speechWindow = window as SpeechRecognitionWindow;
  return Boolean(
    speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition,
  );
}

export function isSpeechSynthesisAvailable(): boolean {
  if (typeof window === "undefined") return false;

  return Boolean(window.speechSynthesis);
}

type JarbasVoice = {
  lang?: string;
  name?: string;
};

function selectPortugueseVoice(voices: JarbasVoice[]) {
  const portugueseVoices = voices.filter((voice) =>
    voice.lang?.toLowerCase().startsWith("pt"),
  );

  return (
    portugueseVoices.find((voice) => {
      const name = voice.name?.toLowerCase() ?? "";
      return (
        voice.lang?.toLowerCase() === "pt-br" &&
        (name.includes("natural") ||
          name.includes("online") ||
          name.includes("google"))
      );
    }) ??
    portugueseVoices.find(
      (voice) => voice.lang?.toLowerCase() === "pt-br",
    ) ??
    portugueseVoices[0] ??
    null
  );
}

export function createSpeechUtterance(
  text: string,
  voices: JarbasVoice[] = [],
): SpeechSynthesisUtterance {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  utterance.rate = 0.92;
  utterance.pitch = 0.88;

  const voice = selectPortugueseVoice(voices);
  if (voice) {
    utterance.voice = voice as SpeechSynthesisVoice;
  }

  return utterance;
}

export const browserVoiceProvider: VoiceProvider = {
  speak(text: string) {
    if (!isSpeechSynthesisAvailable()) return false;

    const voices = window.speechSynthesis.getVoices();
    const utterance = createSpeechUtterance(text, voices);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);

    return true;
  },
};

let activeRemoteAudio: HTMLAudioElement | null = null;

function stopActiveSpeech() {
  activeRemoteAudio?.pause();
  activeRemoteAudio = null;

  if (isSpeechSynthesisAvailable()) {
    window.speechSynthesis.cancel();
  }
}

async function speakWithRemoteAudio(text: string): Promise<boolean> {
  const response = await fetch("/api/jarbas/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (response.status === 204) return false;
  if (!response.ok) throw new Error("Jarbas TTS provider failed");

  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);

  activeRemoteAudio = new Audio(audioUrl);
  activeRemoteAudio.onended = () => URL.revokeObjectURL(audioUrl);
  activeRemoteAudio.onerror = () => URL.revokeObjectURL(audioUrl);

  await activeRemoteAudio.play();

  return true;
}

async function speakWithRemoteFallback(text: string) {
  try {
    const remoteStarted = await speakWithRemoteAudio(text);
    if (remoteStarted) return;
  } catch {
    // Keep Jarbas silent rather than switching to an unintended browser voice.
    return;
  }

  // Only use browser speech when remote TTS is intentionally not configured.
  browserVoiceProvider.speak(text);
}

export function speak(text: string): boolean {
  if (typeof window === "undefined") return false;

  stopActiveSpeech();
  void speakWithRemoteFallback(text);

  return true;
}

export function createSpeechRecognition(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;

  const speechWindow = window as SpeechRecognitionWindow;
  const Recognition =
    speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

  if (!Recognition) return null;

  const recognition = new Recognition();
  recognition.lang = "pt-BR";
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  return recognition;
}
