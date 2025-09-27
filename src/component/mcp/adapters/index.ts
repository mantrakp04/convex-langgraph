export { DEFAULT_IMAGE, DEFAULT_SERVER_PORT, DEFAULT_CONFIG_PATH, DEFAULT_RESTART_PATH } from "./constants.js";
import { v } from "convex/values";
import { internalAction } from "../../_generated/server.js";
import { FlyAdapter, type FlyConfig } from "./flyio/index.js";
import type { MCPAdapter } from "./types.js";
import { internal } from "../../_generated/api.js";
import { vMCPDoc, vMCPAdapterConfig } from "../../../validators.js";

const getAdapter = (name: string, config: Record<string, unknown>): MCPAdapter => {
  if (name === "flyio") {
    return new FlyAdapter(config as FlyConfig);
  }
  throw new Error(`Adapter ${name} not found`);
}

export const provision = internalAction({
  args: {
    mcp: vMCPDoc,
    provisionConfig: v.optional(v.record(v.string(), v.any())),
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);    
    try {
      const provisionResult = await adapter?.provision(args.provisionConfig || {});
      if (!provisionResult) {
        throw new Error("Failed to provision MCP");
      }
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
        patch: {
          status: "running",
          resourceId: provisionResult.resourceId,
          url: provisionResult.url,
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
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
    mcp: vMCPDoc,
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    
    try {
      await adapter?.start(args.mcp.resourceId!);
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
        patch: {
          status: "running",
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
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
    mcp: vMCPDoc,
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    
    try {
      await adapter?.stop(args.mcp.resourceId!);
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
        patch: {
          status: "stopped",
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
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
    mcp: vMCPDoc,
    config: vMCPAdapterConfig,
  },
  handler: async (ctx, args) => {
    const adapter = getAdapter(args.config.adapter || "flyio", args.config.config);
    try {
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
        patch: {
          status: "restarting",
        },
      });
      
      await adapter?.restart(args.mcp.resourceId!);
      
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
        patch: {
          status: "running",
        },
      });
    } catch (error) {
      await ctx.runMutation(internal.mcp.index.update, {
        id: args.mcp._id,
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
    await adapter?.remove(args.mcp.resourceId!);
  }
})
