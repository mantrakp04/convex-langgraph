export { DEFAULT_IMAGE, DEFAULT_SERVER_PORT, DEFAULT_CONFIG_PATH, DEFAULT_RESTART_PATH } from "./constants.js";
import { v } from "convex/values";
import { internalAction } from "../../_generated/server.js";
import { FlyAdapter, type FlyConfig } from "./flyio/index.js";
import type { MCPAdapter } from "./types.js";
import { api, internal } from "../../_generated/api.js";
import { vMCPDoc, vMCPAdapterConfig } from "../../../validators.js";

const getAdapter = (name: string, config: Record<string, unknown>): MCPAdapter => {
  if (name === "flyio") {
    return new FlyAdapter(config as FlyConfig);
  }
  throw new Error(`Adapter ${name} not found`);
}

export const provision = internalAction({
  args: {
    userId: v.optional(v.string()),
    provisionConfig: v.optional(v.record(v.string(), v.any())),
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    const mcp = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (!mcp) {
      throw new Error("MCP not found");
    }
    
    try {
      const url = await adapter?.provision(mcp, args.provisionConfig || {});
      if (!url) {
        throw new Error("Failed to provision MCP");
      }
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "running",
          url,
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "error",
        },
      });
      throw error;
    }
  }
})

export const start = internalAction({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const mcp = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (!mcp) {
      throw new Error("MCP not found");
    }
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    
    try {
      await adapter?.start(mcp);
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "running",
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "error",
        },
      });
      throw error;
    }
  }
})

export const stop = internalAction({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const mcp = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (!mcp) {
      throw new Error("MCP not found");
    }
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    
    try {
      await adapter?.stop(mcp);
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "stopped",
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "error",
        },
      });
      throw error;
    }
  }
})

export const restart = internalAction({
  args: {
    userId: v.optional(v.string()),
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const mcp = await ctx.runQuery(api.mcp.index.get, { userId: args.userId });
    if (!mcp) {
      throw new Error("MCP not found");
    }
    
    try {
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "restarting",
        },
      });
      
      const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
      await adapter?.restart(mcp);
      
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "running",
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        userId: args.userId,
        config: args.config,
        patch: {
          status: "error",
        },
      });
      throw error;
    }
  }
})

export const remove = internalAction({
  args: {
    mcp: vMCPDoc,
    config: vMCPAdapterConfig,
  },
  returns: v.null(),
  handler: async (_ctx, args) => {
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    await adapter?.remove(args.mcp);
  }
})
