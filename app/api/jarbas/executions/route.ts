import { NextResponse } from "next/server";
import { JARBAS_AGENTS } from "@/lib/agents";
import { triggerCargaPnWorkflow } from "@/lib/n8n";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as { uploadedFileId?: string };

  if (!body.uploadedFileId) {
    return NextResponse.json(
      { error: "uploaded_file_required" },
      { status: 400 },
    );
  }

  const { data: group } = await supabase
    .from("groups")
    .select("id,slug")
    .eq("slug", "solucoes")
    .single();

  const { data: agent } = await supabase
    .from("agents")
    .select("id,slug")
    .eq("slug", "carga-pn-excel")
    .single();

  if (!group || !agent) {
    return NextResponse.json(
      { error: "agent_not_configured" },
      { status: 500 },
    );
  }

  const registryAgent = JARBAS_AGENTS[0];
  const { data: uploadedFile } = await supabase
    .from("jarbas_uploaded_files")
    .select("id,bucket,file_path")
    .eq("id", body.uploadedFileId)
    .eq("user_id", authData.user.id)
    .single();

  if (!uploadedFile) {
    return NextResponse.json(
      { error: "uploaded_file_not_found" },
      { status: 404 },
    );
  }

  const { data: signed } = await supabase.storage
    .from(uploadedFile.bucket)
    .createSignedUrl(uploadedFile.file_path, 60 * 30);

  if (!signed?.signedUrl) {
    return NextResponse.json({ error: "signed_url_failed" }, { status: 500 });
  }

  const { data: execution, error: executionError } = await supabase
    .from("jarbas_executions")
    .insert({
      user_id: authData.user.id,
      group_id: group.id,
      agent_id: agent.id,
      workflow_id: registryAgent.workflowId,
      uploaded_file_id: uploadedFile.id,
      status: "file_received",
      current_step: "recebendo arquivo",
      progress_percent: 5,
    })
    .select("id,status,current_step,progress_percent")
    .single();

  if (executionError || !execution) {
    return NextResponse.json(
      { error: "execution_create_failed" },
      { status: 500 },
    );
  }

  await triggerCargaPnWorkflow({
    executionId: execution.id,
    userId: authData.user.id,
    groupId: group.id,
    agentId: agent.id,
    bucket: uploadedFile.bucket,
    filePath: uploadedFile.file_path,
    signedUrl: signed.signedUrl,
  });

  return NextResponse.json({ execution });
}
