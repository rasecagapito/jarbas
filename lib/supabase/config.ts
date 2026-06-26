export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_PUBLIC?: string;
  [key: string]: string | undefined;
};

export function resolveSupabaseConfig(env: SupabaseEnv): SupabaseConfig {
  const url = env.NEXT_PUBLIC_SUPABASE_URL ?? env.VITE_SUPABASE_URL;
  const anonKey =
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_PUBLIC;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, anonKey };
}

export function getSupabaseConfig(): SupabaseConfig {
  return resolveSupabaseConfig(process.env);
}
