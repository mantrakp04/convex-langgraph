import z from "zod/v3";
import { createTool, type ToolCtx } from "./createTool.js";
import type { AgentComponent } from "./types.js";
import { embed } from "ai";
import { getModelName } from "../shared.js";

type Label = "human" | "persona";

function labelSchema() {
  return z
    .enum(["human", "persona"])
    .describe("The memory block to edit: either 'human' or 'persona'");
}

async function ensureCoreMemory(ctx: ToolCtx, component: AgentComponent) {
  return await ctx.runMutation(component.coreMemories.getOrCreate, {
    userId: ctx.userId,
    persona: "",
    human: "",
  });
}

export function memoryTools(component: AgentComponent) {
  const memory_rethink = createTool({
    description:
      "Completely rewrite a core memory block. Use for large reorganizations, not small edits.",
    args: z
      .object({
        label: labelSchema(),
        new_memory: z
          .string()
          .describe(
            "The new memory contents with information integrated from existing memory blocks and context.",
          ),
      })
      .required(),
    handler: async (ctx, { label, new_memory }): Promise<string> => {
      await ensureCoreMemory(ctx, component);
      if (label === "persona") {
        await ctx.runMutation(component.coreMemories.update, {
          userId: ctx.userId,
          persona: new_memory,
        });
      } else {
        await ctx.runMutation(component.coreMemories.update, {
          userId: ctx.userId,
          human: new_memory,
        });
      }
      return `Rewrote core memory '${label}'.`;
    },
  });

  const memory_append = createTool({
    description: "Append to the contents of core memory.",
    args: z
      .object({
        label: labelSchema().describe("Section of the memory to edit."),
        content: z
          .string()
          .describe(
            "Content to append to the memory. All unicode (including emojis) are supported.",
          ),
      })
      .required(),
    handler: async (ctx, { label, content }): Promise<string> => {
      await ensureCoreMemory(ctx, component);
      await ctx.runMutation(component.coreMemories.append, {
        userId: ctx.userId,
        field: label as Label,
        text: content,
      });
      return `Appended ${content.length} character(s) to '${label}'.`;
    },
  });

  const memory_replace = createTool({
    description:
      "Replace the contents of core memory. To delete memories, use an empty string for new_content.",
    args: z
      .object({
        label: labelSchema().describe("Section of the memory to edit."),
        old_content: z
          .string()
          .describe("String to replace. Must be an exact match."),
        new_content: z
          .string()
          .describe(
            "Content to write to the memory. All unicode (including emojis) are supported.",
          ),
      })
      .required(),
    handler: async (ctx, { label, old_content, new_content }): Promise<string> => {
      await ensureCoreMemory(ctx, component);
      try {
        const occurrences = await ctx.runMutation(component.coreMemories.replace, {
          userId: ctx.userId,
          field: label as Label,
          oldContent: old_content,
          newContent: new_content,
        });
        return occurrences > 0
          ? `Replaced ${occurrences} occurrence(s) in '${label}'.`
          : `No exact matches found in '${label}'.`;
      } catch (error) {
        if (error instanceof Error && error.message.includes("oldContent must be non-empty")) {
          return "old_content must be non-empty for replacement.";
        }
        throw error;
      }
    },
  });

  const message_search = createTool({
    description:
      "Search archival memory (messages) using semantic (embedding-based) and text search with optional temporal filtering.",
    args: z
      .object({
        query: z
          .string()
          .describe("String to search for using semantic similarity."),
        top_k: z
          .number()
          .int()
          .positive()
          .optional()
          .describe(
            "Maximum number of results to return. Uses system default if not specified.",
          )
      })
      .required(),
    handler: async (
      ctx,
      { query, top_k },
    ): Promise<string> => {
      const limit = Math.min(Math.max(top_k ?? 10, 1), 100);
      // Vector search if model available; otherwise fallback to text-only
      let embedding: number[] | undefined;
      let embeddingModel: string | undefined;
      const textEmbeddingModel = ctx.agent?.options.textEmbeddingModel;
      if (textEmbeddingModel) {
        try {
          const e = await embed({ model: textEmbeddingModel, value: query });
          embedding = e.embedding;
          embeddingModel = getModelName(textEmbeddingModel);
        } catch {
          embedding = undefined;
          embeddingModel = undefined;
        }
      }

      const messages = await ctx.runAction(component.messages.searchMessages, {
        searchAllMessagesForUserId: ctx.userId ?? undefined,
        threadId: ctx.userId ? undefined : ctx.threadId,
        text: query,
        textSearch: true,
        vectorSearch: !!embedding,
        embedding,
        embeddingModel,
        limit,
        messageRange: { before: 0, after: 0 },
      });

      if (messages.length === 0) {
        return "No matching messages found.";
      }
      return `Top ${messages.length} result(s):\n` + messages.map((m, i) => `${i + 1}. ${m.text}`).join("\n");
    },
  });

  return {
    memory_rethink,
    memory_append,
    memory_replace,
    message_search,
  } as const;
}

export type MemoryTools = ReturnType<typeof memoryTools>;
