import { afterEach, describe, expect, it, vi } from "vitest";
import { triggerCargaPnWorkflow } from "@/lib/n8n";

describe("triggerCargaPnWorkflow", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("posts the Carga PN execution contract to n8n", async () => {
    process.env = {
      ...originalEnv,
      N8N_JARBAS_CARGA_PN_WEBHOOK_URL: "https://n8n.example/webhook/jarbas",
      N8N_JARBAS_CALLBACK_SECRET: "callback-secret",
    };

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await triggerCargaPnWorkflow({
      executionId: "execution-id",
      userId: "user-id",
      groupId: "group-id",
      agentId: "agent-id",
      bucket: "jarbas-uploads",
      filePath: "user/file.xlsx",
      signedUrl: "https://signed.example/file.xlsx",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://n8n.example/webhook/jarbas",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          execution_id: "execution-id",
          user_id: "user-id",
          group_id: "group-id",
          agent_id: "agent-id",
          bucket: "jarbas-uploads",
          file_path: "user/file.xlsx",
          signed_url: "https://signed.example/file.xlsx",
          callback_secret: "callback-secret",
        }),
      }),
    );
  });

  it("fails clearly when n8n env vars are missing", async () => {
    process.env = { ...originalEnv, N8N_JARBAS_CARGA_PN_WEBHOOK_URL: "" };

    await expect(
      triggerCargaPnWorkflow({
        executionId: "execution-id",
        userId: "user-id",
        groupId: "group-id",
        agentId: "agent-id",
        bucket: "jarbas-uploads",
        filePath: "user/file.xlsx",
        signedUrl: "https://signed.example/file.xlsx",
      }),
    ).rejects.toThrow("n8n Jarbas webhook env vars are missing");
  });
});
