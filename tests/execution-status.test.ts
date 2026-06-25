import { describe, expect, it } from "vitest";
import {
  EXECUTION_STATUSES,
  isTerminalExecutionStatus,
} from "@/lib/execution-status";

describe("execution statuses", () => {
  it("contains the approved MVP statuses", () => {
    expect(EXECUTION_STATUSES).toEqual([
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
    ]);
  });

  it("identifies terminal statuses", () => {
    expect(isTerminalExecutionStatus("finished")).toBe(true);
    expect(isTerminalExecutionStatus("failed")).toBe(true);
    expect(isTerminalExecutionStatus("cancelled")).toBe(true);
    expect(isTerminalExecutionStatus("processing")).toBe(false);
  });
});
