import { NextResponse } from "next/server";
import { getPortalExecution } from "@/lib/portal/gateway";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<unknown> },
) {
  const { id } = (await params) as { id: string };
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await getPortalExecution({
    supabase,
    userId: authData.user.id,
    executionId: id,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json({ execution: result.execution });
}
