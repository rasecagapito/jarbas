import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Jarbas memory migration", () => {
  const sql = readFileSync(
    "supabase/migrations/202606290001_jarbas_memory.sql",
    "utf8",
  );

  it("creates scoped memory tables without global memory", () => {
    expect(sql).toContain("create table if not exists public.jarbas_memories");
    expect(sql).toContain("create table if not exists public.jarbas_learnings");
    expect(sql).toContain("check (scope in ('user', 'group'))");
    expect(sql).not.toContain("'global'");
  });

  it("enables RLS and policies for personal and group memory access", () => {
    expect(sql).toContain("alter table public.jarbas_memories enable row level security");
    expect(sql).toContain("alter table public.jarbas_learnings enable row level security");
    expect(sql).toContain("jarbas_memories_select_scoped");
    expect(sql).toContain("jarbas_memories_insert_scoped");
    expect(sql).toContain("jarbas_learnings_select_scoped");
    expect(sql).toContain("jarbas_learnings_insert_scoped");
    expect(sql).toContain("where ug.user_id = (select auth.uid())");
  });
});
