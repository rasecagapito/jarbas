import { describe, expect, it } from "vitest";
import { resolveSupabaseConfig } from "@/lib/supabase/config";

describe("resolveSupabaseConfig", () => {
  it("uses Next.js public Supabase variables first", () => {
    expect(
      resolveSupabaseConfig({
        NEXT_PUBLIC_SUPABASE_URL: "https://next.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "next-anon",
        VITE_SUPABASE_URL: "https://vite.supabase.co",
        VITE_SUPABASE_ANON_PUBLIC: "vite-anon",
      }),
    ).toEqual({
      url: "https://next.supabase.co",
      anonKey: "next-anon",
    });
  });

  it("falls back to local Vite-style names from the env folder", () => {
    expect(
      resolveSupabaseConfig({
        VITE_SUPABASE_URL: "https://hom.supabase.co",
        VITE_SUPABASE_ANON_PUBLIC: "hom-anon",
      }),
    ).toEqual({
      url: "https://hom.supabase.co",
      anonKey: "hom-anon",
    });
  });

  it("throws a clear error when required variables are missing", () => {
    expect(() => resolveSupabaseConfig({})).toThrow(
      "Missing Supabase environment variables",
    );
  });
});
