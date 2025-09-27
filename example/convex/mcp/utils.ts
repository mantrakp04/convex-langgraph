import { components } from "../_generated/api";
import { mutation, query, action } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "../utils";
import { MCPClient } from "../../../src/client/mcp";

const DEFAULT_CONFIG = {
  adapter: "flyio",
  config: {
    apiToken: process.env.FLY_API_TOKEN || "",
    orgSlug: process.env.FLY_ORG_SLUG || "personal",
    jwtPrivateKey: process.env.JWT_PRIVATE_KEY || "",
  },
  pool: 1,
};

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.runQuery(components.agent.mcp.index.get, { userId });
  },
});

export const provision = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.runMutation(components.agent.mcp.index.getOrAssignAndCreate, {
      userId,
      config: DEFAULT_CONFIG,
      provisionConfig: {},
    });
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    await ctx.runMutation(components.agent.mcp.index.remove, { userId, config: DEFAULT_CONFIG });
    return null;
  },
});

export const getConfig = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const mcpClient = new MCPClient(ctx, components.agent, userId, DEFAULT_CONFIG);
    return await mcpClient.getMcpConfig();
  },
});

export const updateConfig = action({
  args: { config: v.any() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const mcpClient = new MCPClient(ctx, components.agent, userId, DEFAULT_CONFIG);
    return await mcpClient.updateMcpConfig(args.config);
  },
});
