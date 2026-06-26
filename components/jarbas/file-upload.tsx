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

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

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
    <div className="border border-white/10 bg-jarbas-panel p-4">
      <p className="font-semibold text-jarbas-text">Upload Excel Carga PN</p>
      <p className="mt-2 text-sm text-jarbas-muted">{status}</p>
      <input
        className="mt-4 block w-full text-sm text-jarbas-muted file:mr-4 file:border-0 file:bg-jarbas-cyan file:px-4 file:py-2 file:font-semibold file:text-jarbas-bg"
        disabled={loading}
        type="file"
        accept=".xlsx,.xls"
        onChange={onFileChange}
      />
    </div>
  );
}
