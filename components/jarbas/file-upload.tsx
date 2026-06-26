"use client";

import { useState } from "react";

export function FileUpload({
  onExecutionStarted,
}: {
  onExecutionStarted?: (id: string) => void;
}) {
  const [status, setStatus] = useState(
    "Aguardando Excel padrao para Carga PN.",
  );
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setLoading(true);
    setStatus(`Enviando ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    const uploadResponse = await fetch("/api/jarbas/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadResponse.ok) {
      setStatus(
        "Nao foi possivel enviar o Excel. Verifique o arquivo e tente novamente.",
      );
      setLoading(false);
      return;
    }

    const uploadPayload = (await uploadResponse.json()) as {
      file: { id: string };
    };

    const executionResponse = await fetch("/api/jarbas/executions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ uploadedFileId: uploadPayload.file.id }),
    });

    if (!executionResponse.ok) {
      setStatus("Arquivo recebido, mas a execucao nao iniciou. Tente novamente.");
      setLoading(false);
      return;
    }

    const executionPayload = (await executionResponse.json()) as {
      execution: { id: string };
    };

    setStatus("Carga iniciada. Acompanhando progresso.");
    onExecutionStarted?.(executionPayload.execution.id);
    setLoading(false);
  }

  return (
    <div className="jarbas-glass rounded-lg p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-jarbas-cyan">
            Intake
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-jarbas-text">
            Upload Excel Carga PN
          </p>
        </div>
        <span className="rounded border border-jarbas-cyan/30 px-2 py-1 font-mono text-xs uppercase tracking-[0.12em] text-jarbas-cyan">
          XLSX
        </span>
      </div>

      <p className="mt-4 min-h-10 text-sm leading-5 text-jarbas-muted">{status}</p>
      <label className="mt-4 flex min-h-16 cursor-pointer flex-col justify-center gap-2 rounded-lg border border-dashed border-jarbas-cyan/35 bg-jarbas-bg/55 px-4 py-3 text-sm text-jarbas-text transition hover:border-jarbas-cyan sm:flex-row sm:items-center sm:justify-between">
        <span className="font-semibold">
          {loading ? "Enviando arquivo" : "Escolher arquivo"}
        </span>
        <span className="min-w-0 truncate text-jarbas-muted">
          {fileName ?? "Excel .xlsx ou .xls"}
        </span>
        <input
          className="sr-only"
          disabled={loading}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
        />
      </label>
    </div>
  );
}
