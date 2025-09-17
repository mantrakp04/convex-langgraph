import { components } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "../utils";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.runQuery(components.agent.coreMemories.get, { userId });
  },
});

export const getOrCreate = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.runMutation(components.agent.coreMemories.getOrCreate, {
      userId,
      persona: "",
      human: "",
    });
  },
});

export const update = mutation({
  args: {
    persona: v.optional(v.string()),
    human: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await ctx.runMutation(components.agent.coreMemories.update, {
      userId,
      ...args,
    });
  },
});

export const append = mutation({
  args: {
    field: v.union(v.literal("persona"), v.literal("human")),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    await ctx.runMutation(components.agent.coreMemories.append, {
      userId,
      field: args.field,
      text: args.text,
    });
  },
});

export const replace = mutation({
  args: {
    field: v.union(v.literal("persona"), v.literal("human")),
    oldContent: v.string(),
    newContent: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.runMutation(components.agent.coreMemories.replace, {
      userId,
      field: args.field,
      oldContent: args.oldContent,
      newContent: args.newContent,
    });
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    await ctx.runMutation(components.agent.coreMemories.remove, { userId });
  },
});
