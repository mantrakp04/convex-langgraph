import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel.js";
import { internalMutation, mutation, query } from "../_generated/server.js";
import { api, internal } from "../_generated/api.js";
import { partial } from "convex-helpers/validators";
import schema from "../schema.js";
import { vMCPDoc, vMCPAdapterConfig } from "../../validators.js";

export const get = query({
  args: {
    userId: v.optional(v.string()),
  },
  returns: v.union(vMCPDoc, v.null()),
  handler: async (ctx, args): Promise<Doc<"mcps"> | null> => {
    return await ctx.db.query("mcps")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
  },
});

export const getOrCreate = mutation({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
  },
  returns: vMCPDoc,
  handler: async (ctx, args): Promise<Doc<"mcps">> => {
    const exsisting = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (exsisting) {
      return exsisting;
    }
    const newMcpId = await ctx.db.insert("mcps", {
      userId: args.userId,
      status: "pending",
    });
    const newMcpDoc = await ctx.db.get(newMcpId);
    if (!newMcpDoc) {
      throw new Error("Failed to create MCP");
    }
    await ctx.scheduler.runAfter(0, internal.mcp.adapters.index.provision, { userId: args.userId, config: args.config });
    return newMcpDoc;
  },
});

export const update = internalMutation({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
    patch: v.object(partial(schema.tables.mcps.validator.fields)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mcp = await ctx.runMutation(api.mcp.index.getOrCreate, { userId: args.userId, config: args.config });
    await ctx.db.patch(mcp._id, args.patch);
  },
});

export const remove = mutation({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mcp = await ctx.runMutation(api.mcp.index.getOrCreate, { userId: args.userId, config: args.config });
    await ctx.scheduler.runAfter(0, internal.mcp.adapters.index.remove, { mcp, config: args.config });
    await ctx.db.delete(mcp._id);
    return null;
  },
});
