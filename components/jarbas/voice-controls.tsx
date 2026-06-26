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
      aria-label="Ativar voz"
      className="flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-lg border border-jarbas-cyan/50 bg-jarbas-surface/70 px-5 font-semibold text-jarbas-cyan backdrop-blur-xl transition hover:bg-jarbas-cyan/10 active:scale-[0.98]"
      type="button"
      onClick={startVoice}
    >
      <span className="flex h-6 items-end gap-1" aria-hidden="true">
        {[0.1, 0.3, 0.2, 0.4].map((delay) => (
          <span
            className="jarbas-soundwave w-1 rounded-full bg-jarbas-cyan"
            key={delay}
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </span>
      <span>Voz</span>
    </button>
  );
}
