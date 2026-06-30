import { redirect } from "next/navigation";
import { signOut } from "@/app/(auth)/login/actions";
import { JarbasShell } from "@/components/jarbas/jarbas-shell";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { PortalGroup } from "@/lib/portal/types";

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
  const { data: groupRows } = await supabase
    .from("user_groups")
    .select("groups(id,name,slug)")
    .eq("user_id", user.id)
    .limit(20);
  const initialGroups = normalizeGroups(groupRows);

  return (
    <JarbasShell
      displayName={displayName ?? null}
      initialGroups={initialGroups}
      signOutAction={signOut}
    />
  );
}

function normalizeGroups(data: unknown): PortalGroup[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => {
      const group = (row as { groups?: unknown }).groups as
        | Partial<PortalGroup>
        | undefined;
      if (!group?.id || !group.name || !group.slug) return null;

      return {
        id: group.id,
        name: group.name,
        slug: group.slug,
      };
    })
    .filter((group): group is PortalGroup => Boolean(group));
}
