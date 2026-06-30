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
    <section className="jarbas-glass rounded-lg p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-jarbas-text">Execucao Portal</p>
          <p className="mt-1 text-sm text-jarbas-muted">{execution.current_step}</p>
        </div>
        <strong className="text-2xl text-jarbas-cyan">
          {execution.progress_percent}%
        </strong>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded bg-black/40">
        <div
          className="h-2 rounded bg-jarbas-cyan shadow-[0_0_16px_rgba(0,219,233,0.7)]"
          style={{ width: `${execution.progress_percent}%` }}
        />
      </div>

      <div className="mt-4 max-h-40 space-y-2 overflow-auto pr-1">
        {logs.map((log) => (
          <p key={log.id} className="text-sm leading-5 text-jarbas-muted">
            [{log.level}] {log.message}
          </p>
        ))}
      </div>
    </section>
  );
}
