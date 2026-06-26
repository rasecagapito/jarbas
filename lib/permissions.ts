import type { JarbasAgent } from "@/lib/agents";

export function canExecuteAgent(
  userGroupSlugs: string[],
  agent: JarbasAgent,
): boolean {
  return userGroupSlugs.includes(agent.groupSlug);
}
