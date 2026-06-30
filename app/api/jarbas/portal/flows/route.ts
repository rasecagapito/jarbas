import { NextResponse } from "next/server";
import { listPortalFlows } from "@/lib/portal/gateway";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const flows = await listPortalFlows({
    supabase,
    userId: authData.user.id,
  });

  return NextResponse.json({ flows });
}
