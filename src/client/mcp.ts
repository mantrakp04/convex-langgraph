import type { ToolSet } from "ai";
import { experimental_createMCPClient as createMCPClient } from "ai";
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import type { AgentComponent, RunActionCtx, RunMutationCtx, RunQueryCtx } from "./types.js";
import { createJwt } from "../encryption.js";
import { DEFAULT_CONFIG_PATH } from "../component/mcp/adapters/constants.js";
import type { MCPAdapterConfig } from "../validators.js";

// Type-safe MCP config structure based on the proxy's schema
export interface HTTPServerConfig {
  url: string;
  enabled?: boolean;
  headers?: Record<string, string>;
}

export interface CommandServerConfig {
  command: string;
  args?: string[];
  enabled?: boolean;
}

export interface MCPConfig {
  mcpServers: Record<string, HTTPServerConfig | CommandServerConfig>;
}

export type MCPToolsHandle = {
  tools: ToolSet;
  close: () => Promise<void>;
};

export class MCPClient {
  constructor(
    private ctx: RunQueryCtx | RunMutationCtx | RunActionCtx,
    private component: AgentComponent,
    private userId?: string,
    private adapterConfig?: MCPAdapterConfig
  ) {}
  
  async loadMcpTools(): Promise<MCPToolsHandle> {
    const mcp = await this.ctx.runQuery(this.component.mcp.index.get, { userId: this.userId });
    if (!mcp) {
      throw new Error("MCP not found");
    }
    if (mcp.status !== "running" && mcp.url) {
      const authToken = await createJwt({
        key: "auth_token",
        value: mcp._id,
        userId: this.userId,
        jwtPrivateKey: this.adapterConfig?.config.jwtPrivateKey || "",
      });
      
      const client = await createMCPClient({
        transport: new StreamableHTTPClientTransport(new URL(mcp.url), {
          requestInit: {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          },
        }),
      });
      const tools = await client.tools();
      return { tools, close: async () => client.close() };
    }
    return { tools: [] as unknown as ToolSet, close: async () => {} };
  }

  async provisionMcp() {
    if ('runMutation' in this.ctx) {
      const mcp = await this.ctx.runMutation(this.component.mcp.index.getOrCreate, {
        userId: this.userId,
        config: this.adapterConfig || { adapter: "flyio", config: {} }
      });
      if (!mcp) {
        throw new Error("MCP not found");
      }
      return mcp;
    }
    throw new Error("provisionMcp requires RunMutationCtx");
  }

  async getMcpConfig(): Promise<MCPConfig> {
    const mcp = await this.ctx.runQuery(this.component.mcp.index.get, { userId: this.userId });
    if (!mcp || !mcp.url) {
      throw new Error("MCP not found");
    }
    const authToken = await createJwt({
      key: "auth_token",
      value: mcp._id,
      userId: this.userId,
      jwtPrivateKey: this.adapterConfig?.config.jwtPrivateKey || "",
    });
    const url = new URL(mcp.url);
    url.pathname = DEFAULT_CONFIG_PATH;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch MCP config: ${res.status}`);
    }
    return (await res.json());
  }

  async updateMcpConfig(config: MCPConfig): Promise<MCPConfig> {
    const mcp = await this.ctx.runQuery(this.component.mcp.index.get, { userId: this.userId });
    if (!mcp || !mcp.url) {
      throw new Error("MCP not found");
    }
    const authToken = await createJwt({
      key: "auth_token",
      value: mcp._id,
      userId: this.userId,
      jwtPrivateKey: this.adapterConfig?.config.jwtPrivateKey || "",
    });
    const url = new URL(mcp.url);
    url.pathname = DEFAULT_CONFIG_PATH;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(config),
    });
    if (!res.ok) {
      throw new Error(`Failed to update MCP config: ${res.status}`);
    }
    return (await res.json());
  }
}
