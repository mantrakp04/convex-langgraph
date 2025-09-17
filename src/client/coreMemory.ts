import type { ModelMessage } from "ai";
import type { AgentComponent, RunActionCtx, RunQueryCtx } from "./types.js";

/**
 * Load core memory for a user and convert it into system messages.
 * Returns an empty array if no userId provided or no core memory found.
 */
export async function fetchCoreMemoryMessages(
  ctx: RunQueryCtx | RunActionCtx,
  component: AgentComponent,
  userId: string | undefined,
): Promise<ModelMessage[]> {
  if (!userId) return [];
  const coreMemory = await ctx.runQuery(component.coreMemories.get, { userId });
  const messages: ModelMessage[] = [];
  if (coreMemory?.persona) {
    messages.push({
      role: "system",
      content: `Core Memory - Agent Persona: ${coreMemory.persona}`,
    });
  }
  if (coreMemory?.human) {
    messages.push({
      role: "system",
      content: `Core Memory - Human Context: ${coreMemory.human}`,
    });
  }
  return messages;
}
