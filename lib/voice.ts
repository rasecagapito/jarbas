type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
  };

export type VoiceProvider = {
  speak: (text: string) => boolean;
};

export function getGreeting(displayName: string | null | undefined): string {
  const trimmed = displayName?.trim();
  const context =
    "Eu sou o Jarbas. Consultei seus historicos e checklists do grupo Solucoes. Posso iniciar uma carga de Parceiro de Negocio ou continuar uma execucao pendente.";

  if (trimmed) {
    return `Ola, ${trimmed}. ${context}`;
  }

  return `Ola. ${context}`;
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
  return (
    voices.find((voice) => voice.lang?.toLowerCase() === "pt-br") ??
    voices.find((voice) => voice.lang?.toLowerCase().startsWith("pt")) ??
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

export function speak(text: string): boolean {
  return browserVoiceProvider.speak(text);
}
