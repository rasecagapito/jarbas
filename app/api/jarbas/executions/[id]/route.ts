import { NextResponse } from "next/server";
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

  const { data: execution } = await supabase
    .from("jarbas_executions")
    .select(
      "id,status,current_step,progress_percent,summary,created_at,started_at,finished_at",
    )
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .single();

  if (!execution) {
    return NextResponse.json(
      { error: "execution_not_found" },
      { status: 404 },
    );
  }

  const { data: logs } = await supabase
    .from("jarbas_execution_logs")
    .select("id,level,message,row_number,card_code,cnpj,created_at")
    .eq("execution_id", id)
    .order("created_at", { ascending: true })
    .limit(50);

  return NextResponse.json({ execution, logs: logs ?? [] });
}
