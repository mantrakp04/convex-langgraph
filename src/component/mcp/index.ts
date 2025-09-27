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

export const getOrAssignAndCreate = mutation({
  args: {
    userId: v.optional(v.string()),
    provisionConfig: v.optional(v.record(v.string(), v.any())),
    config: vMCPAdapterConfig,
  },
  returns: v.union(vMCPDoc, v.null()),
  handler: async (ctx, args): Promise<Doc<"mcps"> | null> => {
    const exsisting = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (exsisting) {
      return exsisting;
    }
    const unassignedMcps = await ctx.db.query("mcps")
      .withIndex("userId", (q) => q.eq("userId", undefined))
      .collect();
    if (args.config.pool && args.config.pool > 0 && (unassignedMcps.length - 1) < args.config.pool) {
      const numToProvision = args.config.pool - (unassignedMcps.length - 1);
      await Promise.all(Array.from({ length: numToProvision }, async () => {
        const newMcpId = await ctx.db.insert("mcps", {
          userId: undefined,
          status: "pending",
        });
        const newMcpDoc = await ctx.db.get(newMcpId);
        if (!newMcpDoc) {
          throw new Error("Failed to create MCP");
        }
        unassignedMcps.push(newMcpDoc);
        await ctx.scheduler.runAfter(0, internal.mcp.adapters.index.provision, { mcp: newMcpDoc, config: args.config, provisionConfig: args.provisionConfig });
      }))
    }

    if (unassignedMcps.length > 0) {
      const toAssign = unassignedMcps[0];
      await ctx.db.patch(toAssign._id, { userId: args.userId });
      const assignedMcp = await ctx.db.get(toAssign._id);
      if (!assignedMcp) {
        throw new Error("Failed to assign MCP");
      }
      return assignedMcp;
    }

    return null;
  },
});

export const update = internalMutation({
  args: {
    id: v.id("mcps"),
    patch: v.object(partial(schema.tables.mcps.validator.fields)),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, args.patch);
  },
});

export const remove = mutation({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const mcp = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (!mcp) {
      return null;
    }
    await ctx.scheduler.runAfter(0, internal.mcp.adapters.index.remove, { mcp, config: args.config });
    await ctx.db.delete(mcp._id);
    return null;
  },
});
