"use client";

import { useState } from "react";

export function ChatComposer({
  onSend,
}: {
  onSend: (message: string) => void | Promise<void>;
}) {
  const [value, setValue] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = value.trim();
    if (!message) return;

    setValue("");
    await onSend(message);
  }

  return (
    <form
      className="group flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center"
      onSubmit={submit}
    >
      <div className="flex min-h-14 min-w-0 flex-1 items-center rounded-lg border border-white/10 bg-jarbas-surface/70 px-4 shadow-2xl shadow-black/30 backdrop-blur-xl transition group-focus-within:border-jarbas-cyan group-focus-within:shadow-[0_0_34px_rgba(0,219,233,0.14)]">
        <input
          aria-label="Instrucao para o Jarbas"
          className="min-w-0 flex-1 bg-transparent py-3 text-jarbas-text outline-none placeholder:text-jarbas-muted"
          placeholder="Digite a instrucao operacional..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </div>
      <button
        className="min-h-14 shrink-0 rounded-lg bg-jarbas-cyan px-5 font-semibold text-jarbas-bg shadow-[0_0_26px_rgba(0,219,233,0.22)] transition hover:shadow-[0_0_42px_rgba(0,219,233,0.38)] active:scale-[0.98] sm:w-auto"
        type="submit"
      >
        Enviar
      </button>
    </form>
  );
}
