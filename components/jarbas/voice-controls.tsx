"use client";

import { useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionAvailable,
} from "@/lib/voice";

export function VoiceControls({
  onNotice,
  onTranscript,
}: {
  onNotice: (message: string) => void;
  onTranscript: (message: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const available = isSpeechRecognitionAvailable();

  function startVoice() {
    if (!available) {
      onNotice(
        "Entrada por voz indisponivel neste navegador. Use o campo de texto.",
      );
      return;
    }

    const recognition = createSpeechRecognition();

    if (!recognition) {
      onNotice(
        "Entrada por voz indisponivel neste navegador. Use o campo de texto.",
      );
      return;
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = () => {
      onNotice("Nao consegui capturar sua voz agora. Use o campo de texto.");
    };
    recognition.onend = () => setListening(false);

    setListening(true);
    recognition.start();
  }

  return (
    <button
      aria-label="Ativar voz"
      className="flex min-h-14 shrink-0 items-center justify-center gap-3 rounded-lg border border-jarbas-cyan/50 bg-jarbas-surface/70 px-5 font-semibold text-jarbas-cyan backdrop-blur-xl transition hover:bg-jarbas-cyan/10 active:scale-[0.98]"
      type="button"
      disabled={listening}
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
      <span>{listening ? "Ouvindo" : "Voz"}</span>
    </button>
  );
}
