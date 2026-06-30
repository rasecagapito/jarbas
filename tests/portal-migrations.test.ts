import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("Jarbas portal migrations", () => {
  const agentsSql = readFileSync(
    "supabase/migrations/202606290002_jarbas_portal_agents.sql",
    "utf8",
  );
  const conversationSql = readFileSync(
    "supabase/migrations/202606290003_conversation_history_group_scope.sql",
    "utf8",
  );

  it("parametrizes portal and SAP agents for the Solucoes group", () => {
    expect(agentsSql).toContain("operador-portal-cargas");
    expect(agentsSql).toContain("consultor-sap-b1");
    expect(agentsSql).toContain("join public.groups g on g.slug = 'solucoes'");
    expect(agentsSql).toContain("on conflict (agent_id, group_id)");
  });

  it("scopes conversation history by group with RLS membership checks", () => {
    expect(conversationSql).toContain("add column if not exists group_id");
    expect(conversationSql).toContain("conversation_history_group_id_created_at_idx");
    expect(conversationSql).toContain("drop policy if exists conversation_history_select_own");
    expect(conversationSql).toContain("where ug.user_id = (select auth.uid())");
    expect(conversationSql).toContain("ug.group_id = conversation_history.group_id");
  });
});
