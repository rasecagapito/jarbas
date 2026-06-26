export type ExecutionView = {
  id: string;
  status: string;
  current_step: string;
  progress_percent: number;
  summary: Record<string, unknown>;
};

export type ExecutionLogView = {
  id: string;
  level: "info" | "warning" | "error";
  message: string;
  row_number: number | null;
  card_code: string | null;
  cnpj: string | null;
  created_at: string;
};

export function ExecutionProgress({
  execution,
  logs,
}: {
  execution: ExecutionView | null;
  logs: ExecutionLogView[];
}) {
  if (!execution) {
    return null;
  }

  return (
    <section className="border border-white/10 bg-jarbas-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-jarbas-text">Execucao Carga PN</p>
          <p className="text-sm text-jarbas-muted">{execution.current_step}</p>
        </div>
        <strong className="text-2xl text-jarbas-cyan">
          {execution.progress_percent}%
        </strong>
      </div>

      <div className="mt-4 h-2 bg-black/30">
        <div
          className="h-2 bg-jarbas-cyan"
          style={{ width: `${execution.progress_percent}%` }}
        />
      </div>

      <div className="mt-4 space-y-2">
        {logs.map((log) => (
          <p key={log.id} className="text-sm text-jarbas-muted">
            [{log.level}] {log.message}
          </p>
        ))}
      </div>
    </section>
  );
}
