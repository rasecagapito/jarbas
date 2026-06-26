type SpeechRecognitionWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: unknown;
    webkitSpeechRecognition?: unknown;
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

  return "speechSynthesis" in window;
}

export function speak(text: string): void {
  if (!isSpeechSynthesisAvailable()) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "pt-BR";
  window.speechSynthesis.speak(utterance);
}
