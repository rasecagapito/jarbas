"use client";

import { isSpeechRecognitionAvailable } from "@/lib/voice";

export function VoiceControls({
  onTranscript,
}: {
  onTranscript: (message: string) => void;
}) {
  const available = isSpeechRecognitionAvailable();

  function startVoice() {
    if (!available) {
      onTranscript(
        "Entrada por voz indisponivel neste navegador. Use o campo de texto.",
      );
      return;
    }

    onTranscript("Entrada por voz habilitada. Fale a instrucao para o Jarbas.");
  }

  return (
    <button
      className="shrink-0 border border-jarbas-cyan px-5 py-3 font-semibold text-jarbas-cyan"
      type="button"
      onClick={startVoice}
    >
      Voz
    </button>
  );
}
