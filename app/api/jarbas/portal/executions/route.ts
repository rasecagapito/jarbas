import { NextResponse } from "next/server";
import {
  listPortalExecutions,
  startPortalExecution,
} from "@/lib/portal/gateway";
import type { StartPortalExecutionRequest } from "@/lib/portal/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function createStartRequest(body: unknown): StartPortalExecutionRequest | null {
  const payload = body as {
    flowId?: unknown;
    groupId?: unknown;
    input?: unknown;
  };

  if (typeof payload.flowId !== "string" || typeof payload.groupId !== "string") {
    return null;
  }

  const request: StartPortalExecutionRequest = {
    flowId: payload.flowId,
    groupId: payload.groupId,
  };

  if (
    payload.input &&
    typeof payload.input === "object" &&
    !Array.isArray(payload.input)
  ) {
    request.input = payload.input as Record<string, unknown>;
  }

  return request;
}

export async function GET(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const groupId = new URL(request.url).searchParams.get("groupId");
  const executions = await listPortalExecutions({
    supabase,
    userId: authData.user.id,
    groupId,
  });

  return NextResponse.json({ executions });
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const startRequest = createStartRequest(body);

  if (!startRequest) {
    return NextResponse.json(
      { error: "flow_id_and_group_id_required" },
      { status: 400 },
    );
  }

  const result = await startPortalExecution({
    supabase,
    userId: authData.user.id,
    request: startRequest,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ execution: result.execution });
}
