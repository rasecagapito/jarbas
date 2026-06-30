"use client";

import { useEffect, useRef, useState } from "react";
import { AgentPanel } from "@/components/jarbas/agent-panel";
import { ChatComposer } from "@/components/jarbas/chat-composer";
import {
  ExecutionProgress,
  type ExecutionLogView,
  type ExecutionView,
} from "@/components/jarbas/execution-progress";
import { FileUpload } from "@/components/jarbas/file-upload";
import { VoiceControls } from "@/components/jarbas/voice-controls";
import type {
  PortalExecution,
  PortalFlow,
  PortalGroup,
} from "@/lib/portal/types";
import { getGreeting, isJarbasVoiceEnabled, speak } from "@/lib/voice";

const JARBAS_CORE_VIDEO =
  "https://res.cloudinary.com/dswwqkues/video/upload/v1782399147/jarbas_sem_fundo_transparente_anmayy.webm";

export function JarbasShell({
  displayName,
  initialGroups = [],
  pollIntervalMs = 2500,
  signOutAction,
}: {
  displayName: string | null;
  initialGroups?: PortalGroup[];
  pollIntervalMs?: number;
  signOutAction: () => Promise<void>;
}) {
  const [messages, setMessages] = useState<string[]>([]);
  const [executionId, setExecutionId] = useState<string | null>(null);
  const [executionSource, setExecutionSource] = useState<"legacy" | "portal">(
    "legacy",
  );
  const [execution, setExecution] = useState<ExecutionView | null>(null);
  const [logs, setLogs] = useState<ExecutionLogView[]>([]);
  const [portalFlows, setPortalFlows] = useState<PortalFlow[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    initialGroups[0]?.id ?? null,
  );
  const hasGreetedRef = useRef(false);
  const voiceEnabled = isJarbasVoiceEnabled();

  useEffect(() => {
    if (hasGreetedRef.current) return;
    hasGreetedRef.current = true;

    const greeting = getGreeting(displayName);
    setMessages([greeting]);
    if (voiceEnabled) {
      speak(greeting);
    }
  }, [displayName, voiceEnabled]);

  useEffect(() => {
    let cancelled = false;

    async function loadPortalFlows() {
      try {
        const response = await fetch("/api/jarbas/portal/flows");
        if (!response.ok) return;

        const payload = (await response.json()) as { flows?: PortalFlow[] };
        if (cancelled || !Array.isArray(payload.flows)) return;

        setPortalFlows(payload.flows);
        if (!activeGroupId && payload.flows[0]?.groupId) {
          setActiveGroupId(payload.flows[0].groupId);
        }
      } catch {
        setPortalFlows([]);
      }
    }

    void loadPortalFlows();

    return () => {
      cancelled = true;
    };
  }, [activeGroupId]);

  useEffect(() => {
    if (!executionId) return;

    const timer = window.setInterval(async () => {
      const response = await fetch(
        executionSource === "portal"
          ? `/api/jarbas/portal/executions/${executionId}`
          : `/api/jarbas/executions/${executionId}`,
      );
      if (!response.ok) return;

      if (executionSource === "portal") {
        const payload = (await response.json()) as {
          execution: PortalExecution;
        };
        setExecution({
          id: payload.execution.id,
          status: payload.execution.status,
          current_step: payload.execution.currentStep,
          progress_percent: payload.execution.progressPercent,
          summary: payload.execution.summary,
        });
        setLogs([]);
        return;
      }

      const payload = (await response.json()) as {
        execution: ExecutionView;
        logs: ExecutionLogView[];
      };
      setExecution(payload.execution);
      setLogs(payload.logs);
    }, pollIntervalMs);

    return () => window.clearInterval(timer);
  }, [executionId, executionSource, pollIntervalMs]);

  const visibleMessages = messages.slice(-3);

  async function sendChatMessage(message: string, channel: "text" | "voice" = "text") {
    setMessages((current) => [...current, message]);

    try {
      const response = await fetch("/api/jarbas/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          channel,
          ...(activeGroupId ? { groupId: activeGroupId } : {}),
        }),
      });

      const payload = (await response.json()) as {
        message?: string;
        portal?: {
          execution?: {
            id?: string;
          };
        };
      };
      const assistantMessage = response.ok
        ? payload.message
        : "Nao consegui processar sua mensagem agora. Tente novamente em instantes.";

      if (!assistantMessage) return;

      if (payload.portal?.execution?.id) {
        setExecutionSource("portal");
        setExecutionId(payload.portal.execution.id);
      }

      setMessages((current) => [...current, assistantMessage]);
      if (voiceEnabled) {
        speak(assistantMessage);
      }
    } catch {
      const fallbackMessage =
        "Nao consegui me comunicar com o cerebro do Jarbas agora. Tente novamente em instantes.";

      setMessages((current) => [...current, fallbackMessage]);
      if (voiceEnabled) {
        speak(fallbackMessage);
      }
    }
  }

  return (
    <main className="jarbas-circuit relative min-h-screen overflow-x-hidden text-jarbas-text">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="jarbas-scanline absolute inset-x-0 top-0 h-1/2" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-jarbas-cyan/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <header className="fixed inset-x-0 top-0 z-30 border-b border-white/10 bg-jarbas-surface/55 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className="font-display text-xl font-semibold text-jarbas-blue sm:text-2xl">
              Jarbas / S.A.M.
            </p>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-jarbas-muted">
              Secure Automated Multi-Agent Platform
            </p>
          </div>

          <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-[0.16em] text-jarbas-muted md:flex">
            <span className="text-jarbas-cyan">Cluster</span>
            <span>Workflows</span>
            <span>Logs</span>
          </nav>

          <form action={signOutAction}>
            <button
              className="rounded-lg border border-jarbas-cyan/50 px-4 py-2 text-sm font-semibold text-jarbas-cyan transition hover:bg-jarbas-cyan/10 active:scale-[0.98]"
              type="submit"
            >
              Sair
            </button>
          </form>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-[1500px] grid-cols-1 gap-4 px-4 pb-5 pt-24 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)_330px] lg:px-8">
        <AgentPanel
          activeGroupId={activeGroupId}
          flows={portalFlows}
          groups={initialGroups}
          onActiveGroupChange={setActiveGroupId}
        />

        <section className="flex min-h-[640px] flex-col items-center justify-between overflow-hidden rounded-lg border border-white/10 bg-jarbas-surface/35 p-4 backdrop-blur-md sm:p-6 lg:min-h-[calc(100vh-7.25rem)]">
          <div className="flex w-full items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-jarbas-cyan">
                Jarbas MVP
              </p>
              <h1 className="mt-2 font-display text-2xl font-semibold text-jarbas-blue sm:text-3xl">
                Cockpit Portal de Cargas
              </h1>
            </div>
            <div className="hidden rounded border border-white/10 px-3 py-2 font-mono text-xs uppercase tracking-[0.14em] text-jarbas-muted sm:block">
              Health <span className="text-jarbas-cyan">99.9%</span>
            </div>
          </div>

          <div className="relative flex w-full flex-1 flex-col items-center justify-center py-5">
            <JarbasCore />

            <div className="w-full max-w-3xl">
              <div className="mb-4 min-h-20 space-y-3">
                {visibleMessages.map((message, index) => (
                  <div
                    key={`${index}-${message}`}
                    className="jarbas-glass rounded-lg px-4 py-3 text-sm leading-6 text-jarbas-text"
                  >
                    {message}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <ChatComposer
                  onSend={sendChatMessage}
                />
                {voiceEnabled ? (
                  <VoiceControls
                    onNotice={(message) =>
                      setMessages((current) => [...current, message])
                    }
                    onTranscript={(message) =>
                      void sendChatMessage(message, "voice")
                    }
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <FileUpload
            onExecutionStarted={(id) => {
              setExecutionSource("legacy");
              setExecutionId(id);
            }}
          />
          <ExecutionProgress execution={execution} logs={logs} />
        </aside>
      </div>
    </main>
  );
}

function JarbasCore() {
  return (
    <div className="jarbas-float relative mb-3 flex h-[280px] w-[280px] shrink-0 items-center justify-center sm:h-[360px] sm:w-[360px] xl:h-[440px] xl:w-[440px]">
      <div className="jarbas-ring absolute inset-0 rounded-full border border-jarbas-cyan/15" />
      <div className="jarbas-ring-slow absolute inset-6 rounded-full border border-jarbas-blue/15" />
      <div className="absolute inset-12 rounded-full border border-white/10 bg-jarbas-bg/25 backdrop-blur-sm" />
      <video
        aria-label="Nucleo visual do Jarbas"
        autoPlay
        className="jarbas-core-shadow relative z-10 h-[72%] w-[72%] rounded-full object-cover opacity-95 mix-blend-screen"
        loop
        muted
        playsInline
      >
        <source src={JARBAS_CORE_VIDEO} type="video/webm" />
      </video>
      <div className="absolute left-2 top-2 h-8 w-8 border-l-2 border-t-2 border-jarbas-cyan/45" />
      <div className="absolute right-2 top-2 h-8 w-8 border-r-2 border-t-2 border-jarbas-cyan/45" />
      <div className="absolute bottom-2 left-2 h-8 w-8 border-b-2 border-l-2 border-jarbas-cyan/45" />
      <div className="absolute bottom-2 right-2 h-8 w-8 border-b-2 border-r-2 border-jarbas-cyan/45" />
    </div>
  );
}
