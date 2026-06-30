import { NextResponse } from "next/server";
import { buildJarbasContext } from "@/lib/jarbas/context";
import { answerSapQuestion } from "@/lib/sap/consultant";
import type { SapAskRequest } from "@/lib/sap/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function parseRequest(body: unknown): SapAskRequest | null {
  const payload = body as {
    question?: unknown;
    groupId?: unknown;
    context?: unknown;
  };

  if (
    typeof payload.question !== "string" ||
    !payload.question.trim() ||
    typeof payload.groupId !== "string" ||
    !payload.groupId.trim()
  ) {
    return null;
  }

  const request: SapAskRequest = {
    question: payload.question.trim(),
    groupId: payload.groupId.trim(),
  };

  if (
    payload.context &&
    typeof payload.context === "object" &&
    !Array.isArray(payload.context)
  ) {
    const context = payload.context as {
      objectType?: unknown;
      identifier?: unknown;
    };
    request.context = {
      objectType:
        typeof context.objectType === "string" ? context.objectType : undefined,
      identifier:
        typeof context.identifier === "string" ? context.identifier : undefined,
    };
  }

  return request;
}

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const sapRequest = parseRequest(body);

  if (!sapRequest) {
    return NextResponse.json(
      { error: "question_and_group_id_required" },
      { status: 400 },
    );
  }

  const jarbasContext = await buildJarbasContext({
    supabase,
    userId: authData.user.id,
    activeGroupId: sapRequest.groupId,
  });
  const response = await answerSapQuestion({
    question: sapRequest.question,
    groupId: sapRequest.groupId,
    groups: jarbasContext.groups,
    context: sapRequest.context,
  });

  return NextResponse.json(response);
}
