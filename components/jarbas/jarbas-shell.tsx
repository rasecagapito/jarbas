"use client";

import { useEffect, useState } from "react";
import { AgentPanel } from "@/components/jarbas/agent-panel";
import { ChatComposer } from "@/components/jarbas/chat-composer";
import {
  ExecutionProgress,
  type ExecutionLogView,
  type ExecutionView,
} from "@/components/jarbas/execution-progress";
import { FileUpload } from "@/components/jarbas/file-upload";
import { VoiceControls } from "@/components/jarbas/voice-controls";
import { getGreeting, speak } from "@/lib/voice";

export function JarbasShell({
  displayName,
  signOutAction,
}: {
  displayName: string | null;
  signOutAction: () => Promise<void>;
}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [execution, setExecution] = useState<ExecutionView | null>(null);
  const [logs, setLogs] = useState<ExecutionLogView[]>([]);

  useEffect(() => {
    const greeting = getGreeting(displayName);
    setMessages([greeting]);
    speak(greeting);
  }, [displayName]);

  useEffect(() => {
    if (!executionId) return;

    const timer = window.setInterval(async () => {
      const response = await fetch(`/api/jarbas/executions/${executionId}`);
      if (!response.ok) return;

      const payload = (await response.json()) as {
        execution: ExecutionView;
        logs: ExecutionLogView[];
      };
      setExecution(payload.execution);
      setLogs(payload.logs);
    }, 2500);

    return () => window.clearInterval(timer);
  }, [executionId]);

  return (
    <main className="min-h-screen bg-jarbas-bg text-jarbas-text">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[280px_1fr]">
        <AgentPanel />

        <section className="flex min-h-[calc(100vh-3rem)] flex-col border border-white/10 bg-jarbas-surface/70 p-6">
          <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
                Jarbas MVP
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold text-jarbas-blue">
                Cockpit Carga PN Excel
              </h1>
            </div>

            <form action={signOutAction}>
              <button
                className="border border-jarbas-cyan px-4 py-2 text-sm font-semibold text-jarbas-cyan"
                type="submit"
              >
                Sair
              </button>
            </form>
          </header>

          <div className="flex-1 space-y-4 py-5">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message}`}
                className="border border-white/10 bg-jarbas-panel p-4 leading-7"
              >
                {message}
              </div>
            ))}

            <FileUpload onExecutionStarted={setExecutionId} />
            <ExecutionProgress execution={execution} logs={logs} />
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row">
            <ChatComposer
              onSend={(message) =>
                setMessages((current) => [...current, message])
              }
            />
            <VoiceControls
              onTranscript={(message) =>
                setMessages((current) => [...current, message])
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}
