import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/login/actions";
import { JarbasShell } from "@/components/jarbas/jarbas-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default function HomePage() {
  return <JarbasHome />;
}

async function JarbasHome() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name?.trim();

  return <JarbasShell displayName={displayName ?? null} signOutAction={signOut} />;
}
