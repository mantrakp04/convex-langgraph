import { v } from "convex/values";
import { api, internal } from "../_generated/api.js";
import type { Doc, Id } from "../_generated/dataModel.js";
import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server.js";
import { Agent, createThread } from "@convex-dev/agent";
import { components } from "../_generated/api.js";
import { defaultConfig } from "../agents/config.js";
import z from "zod/v4";

export const createObject = action({
  args: {},
  handler: async (ctx, args) => {
    const agent = new Agent(components.agent, {
      ...defaultConfig,
      name: "object-agent",
    });
    const threadid = await createThread(ctx, components.agent);
    const { object } = await agent.generateObject(
      ctx,
      { threadId: threadid },
      {
        prompt: "Generate a plan to make a sandwich",
        schema: z.object({
          summary: z.string(),
          steps: z.array(z.string()),
        }),
      },
    );
    return object;
  },
});
