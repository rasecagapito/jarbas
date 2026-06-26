"use client";

import { useState } from "react";

export function ChatComposer({ onSend }: { onSend: (message: string) => void }) {
  const [value, setValue] = useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;

    onSend(message);
    setValue("");
  }

  return (
    <form className="flex flex-1 gap-3" onSubmit={submit}>
      <input
        aria-label="Instrucao para o Jarbas"
        className="min-w-0 flex-1 border border-white/10 bg-jarbas-panel px-4 py-3 text-jarbas-text outline-none focus:border-jarbas-cyan"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button
        className="shrink-0 bg-jarbas-cyan px-5 py-3 font-semibold text-jarbas-bg"
        type="submit"
      >
        Enviar
      </button>
    </form>
  );
}
