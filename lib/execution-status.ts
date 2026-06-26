export const EXECUTION_STATUSES = [
  "created",
  "waiting_file",
  "file_received",
  "validating_excel",
  "processing",
  "paused_error",
  "waiting_user_action",
  "resuming",
  "finished",
  "failed",
  "cancelled",
] as const;

export type ExecutionStatus = (typeof EXECUTION_STATUSES)[number];

export function isTerminalExecutionStatus(status: ExecutionStatus): boolean {
  return status === "finished" || status === "failed" || status === "cancelled";
}
