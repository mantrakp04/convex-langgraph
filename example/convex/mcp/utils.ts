import { components } from "../_generated/api";
import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "../utils";
import { MCPClient } from "../../../src/client/mcp";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.runQuery(components.agent.mcp.index.get, { userId });
  },
});

export const provision = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    // Default config - in a real app, this would come from environment variables or user settings
    const config = {
      adapter: "flyio",
      config: {
        apiToken: process.env.FLY_API_TOKEN || "",
        orgSlug: process.env.FLY_ORG_SLUG || "personal",
        jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "",
      }
    };
    return await ctx.runMutation(components.agent.mcp.index.getOrCreate, { userId, config });
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    // Default config - in a real app, this would come from environment variables or user settings
    const config = {
      adapter: "flyio",
      config: {
        apiToken: process.env.FLY_API_TOKEN || "",
        orgSlug: process.env.FLY_ORG_SLUG || "personal",
        jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "",
      }
    };
    await ctx.runMutation(components.agent.mcp.index.remove, { userId, config });
    return null;
  },
});

export const getConfig = action({
  args: {},
  returns: v.union(v.any(), v.null()),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const mcp = await ctx.runQuery(components.agent.mcp.index.get, { userId });
    if (!mcp || !mcp.url) {
      return null;
    }
    const mcpClient = new MCPClient(ctx, components.agent, userId, {
      adapter: "flyio",
      config: {
        apiToken: process.env.FLY_API_TOKEN || "",
        orgSlug: process.env.FLY_ORG_SLUG || "personal",
        jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "",
      }
    });
    return await mcpClient.getMcpConfig();
  },
});

export const updateConfig = action({
  args: { config: v.any() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const mcp = await ctx.runQuery(components.agent.mcp.index.get, { userId });
    if (!mcp || !mcp.url) {
      throw new Error("MCP not found");
    }
    const mcpClient = new MCPClient(ctx, components.agent, userId, {
      adapter: "flyio",
      config: {
        apiToken: process.env.FLY_API_TOKEN || "",
        orgSlug: process.env.FLY_ORG_SLUG || "personal",
        jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "",
      }
    });
    return await mcpClient.updateMcpConfig(args.config);
  },
});
