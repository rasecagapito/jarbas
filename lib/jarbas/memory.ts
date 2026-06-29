type SupabaseLike = {
  from: (table: string) => unknown;
};

type QueryBuilder = {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  limit: (...args: unknown[]) => Promise<{ data: unknown; error: unknown }>;
  insert: (...args: unknown[]) => Promise<{ error: unknown }>;
};

export type JarbasMemoryScope = "user" | "group";

export type JarbasMemory = {
  id: string;
  scope: JarbasMemoryScope;
  title: string;
  body: string;
  createdAt: string;
};

type JarbasMemoryInsertRow = {
  scope: JarbasMemoryScope;
  user_id: string | null;
  group_id: string | null;
  created_by: string;
  source: "wrapup";
  title: string;
  body: string;
};

function asQueryBuilder(value: unknown): QueryBuilder {
  return value as QueryBuilder;
}

function normalizeMemories(data: unknown): JarbasMemory[] {
  if (!Array.isArray(data)) return [];

  return data.map((row) => {
    const memory = row as {
      id?: string;
      scope?: JarbasMemoryScope;
      title?: string;
      body?: string;
      created_at?: string;
    };

    return {
      id: memory.id ?? "",
      scope: memory.scope ?? "user",
      title: memory.title ?? "",
      body: memory.body ?? "",
      createdAt: memory.created_at ?? "",
    };
  });
}

async function listPersonalMemories({
  supabase,
  userId,
}: {
  supabase: SupabaseLike;
  userId: string;
}) {
  const query = asQueryBuilder(supabase.from("jarbas_memories"));
  const { data } = await query
    .select("id,scope,title,body,created_at")
    .eq("scope", "user")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return normalizeMemories(data);
}

async function listGroupMemories({
  supabase,
  groupId,
}: {
  supabase: SupabaseLike;
  groupId: string;
}) {
  const query = asQueryBuilder(supabase.from("jarbas_memories"));
  const { data } = await query
    .select("id,scope,title,body,created_at")
    .eq("scope", "group")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false })
    .limit(10);

  return normalizeMemories(data);
}

export async function listAccessibleJarbasMemories({
  supabase,
  userId,
  groupIds,
}: {
  supabase: SupabaseLike;
  userId: string;
  groupIds: string[];
}): Promise<JarbasMemory[]> {
  const memories = await listPersonalMemories({ supabase, userId });

  for (const groupId of groupIds) {
    memories.push(...(await listGroupMemories({ supabase, groupId })));
  }

  return Array.from(
    new Map(memories.map((memory) => [memory.id, memory])).values(),
  );
}

export async function saveJarbasWrapupMemory({
  supabase,
  userId,
  groupId,
  body,
}: {
  supabase: SupabaseLike;
  userId: string;
  groupId: string | null;
  body: string;
}) {
  const rows: JarbasMemoryInsertRow[] = [
    {
      scope: "user",
      user_id: userId,
      group_id: null,
      created_by: userId,
      source: "wrapup",
      title: "Wrapup da sessao",
      body,
    },
  ];

  if (groupId) {
    rows.push({
      scope: "group",
      user_id: null,
      group_id: groupId,
      created_by: userId,
      source: "wrapup",
      title: "Wrapup da sessao",
      body,
    });
  }

  const query = asQueryBuilder(supabase.from("jarbas_memories"));
  const { error } = await query.insert(rows);

  if (error) {
    throw new Error("jarbas_memory_insert_failed");
  }
}
