export type TriggerCargaPnInput = {
  executionId: string;
  userId: string;
  groupId: string;
  agentId: string;
  bucket: string;
  filePath: string;
  signedUrl: string;
};

export async function triggerCargaPnWorkflow(
  input: TriggerCargaPnInput,
): Promise<void> {
  const webhookUrl = process.env.N8N_JARBAS_CARGA_PN_WEBHOOK_URL;
  const callbackSecret = process.env.N8N_JARBAS_CALLBACK_SECRET;

  if (!webhookUrl || !callbackSecret) {
    throw new Error("n8n Jarbas webhook env vars are missing");
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      execution_id: input.executionId,
      user_id: input.userId,
      group_id: input.groupId,
      agent_id: input.agentId,
      bucket: input.bucket,
      file_path: input.filePath,
      signed_url: input.signedUrl,
      callback_secret: callbackSecret,
    }),
  });

  if (!response.ok) {
    throw new Error(`n8n workflow trigger failed with status ${response.status}`);
  }
}
