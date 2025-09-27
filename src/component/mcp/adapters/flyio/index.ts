import type { MCPAdapter } from "../../adapters/types.js";
import * as constants from "../constants.js";
import * as flyTypes from "./types.js";
import * as flyGraphqlTypes from "./graphqlTypes.js";
import { getAuthToken } from "../../utils.js";

export type FlyConfig = {
  apiToken: string;
  orgSlug: string;
  jwtPrivateKey: string;
}

type FlyApp = flyTypes.App
type FlyMachine = flyTypes.Machine
type CreateMachineRequest = flyTypes.CreateMachineRequest

export class FlyAdapter implements MCPAdapter {
  readonly name = "flyio";
  readonly config: FlyConfig;

  constructor(config: FlyConfig) {
    this.config = config;
  }
  
  private async flyRequest(
    path: string,
    method: "GET" | "POST" | "DELETE" | "PUT",
    body?: Record<string, unknown>,
  ) {
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.config.apiToken}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(`${flyTypes.URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Fly API Error: ${path} ${response.status} ${response.statusText}`,
        errorText,
      );
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Fly API request failed: ${response.status} ${errorText}`);
    }

    if (
      response.status === 204 ||
      response.status === 202 ||
      (response.status === 201 && method === "DELETE")
    ) {
      return null;
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const textContent = await response.text();
      if (textContent) {
        return JSON.parse(textContent);
      } else {
        return null;
      }
    }
    return null;
  };

  private async flyGraphqlRequest(
    query: string,
    variables?: Record<string, unknown>,
  ) {
    const headers: HeadersInit = {
      Authorization: `Bearer ${this.config.apiToken}`,
      "Content-Type": "application/json",
    };

    const response = await fetch(flyGraphqlTypes.URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Fly GraphQL API Error: ${response.status} ${response.statusText}`,
        errorText,
      );
      throw new Error(
        `Fly GraphQL API request failed: ${response.status} ${errorText}`,
      );
    }

    const responseData = await response.json();
    if (responseData.errors) {
      console.error("Fly GraphQL API Errors:", responseData.errors);
      throw new Error(
        `GraphQL query failed: ${JSON.stringify(responseData.errors)}`,
      );
    }
    return responseData.data;
  };

  private async createApp(appName: string) {
    const orgQuery = `
      query GetOrganization($slug: String!) {
        organization(slug: $slug) {
          id
          name
          slug
        }
      }
    `;
    
    const orgResult = await this.flyGraphqlRequest(orgQuery, { slug: this.config.orgSlug });
    if (!orgResult?.organization?.id) {
      throw new Error(`Organization not found: ${this.config.orgSlug}`);
    }
    
    const createAppMutation = `
      mutation CreateApp($input: CreateAppInput!) {
        createApp(input: $input) {
          app {
            id
            name
            hostname
            appUrl
          }
        }
      }
    `;
    
    return await this.flyGraphqlRequest(createAppMutation, {
      input: {
        organizationId: orgResult.organization.id,
        name: appName,
        machines: true,
      }
    });
  }

  private async getApp(appName: string): Promise<FlyApp> {
    return await this.flyRequest(`/apps/${appName}`, "GET");
  }

  private async getMachine(appName: string, machineId: string): Promise<FlyMachine> {
    return await this.flyRequest(`/apps/${appName}/machines/${machineId}`, "GET");
  }

  private async getMachineByName(appName: string, machineName: string): Promise<FlyMachine | null> {
    const machines = await this.flyRequest(`/apps/${appName}/machines`, "GET");
    if (!machines) return null;
    return machines.find((m: FlyMachine) => m.name === machineName) || null;
  }

  private async waitUntilHealthy(appName: string, machineId: string, options?: { timeout?: number, interval?: number }): Promise<void> {
    const startTime = Date.now();
    const endTime = startTime + (options?.timeout || 300000);
    const interval = options?.interval || 5000;
    while (Date.now() < endTime) {
      const machine = await this.getMachine(appName, machineId);
      if (machine.checks && machine.checks.length > 0) {
        const allPassing = machine.checks.every(
          (check) => ["passing", "success", "ok"].includes(check.status || ""),
        );
        if (allPassing) {
          return;
        }
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    console.error(`Machine ${machineId} not healthy after ${options?.timeout || 300000}ms`);
  }

  private async allocateIp(appName: string, type: "v4" | "v6" | "shared_v4") {
    const mutation = `
      mutation AllocateIpAddress($appId: ID!, $type: IPAddressType!) {
        allocateIpAddress(input: { appId: $appId, type: $type, region: "global" }) {
          ipAddress { id address type region createdAt }
        }
      }
    `;
    
    try {
      return await this.flyGraphqlRequest(mutation, { appId: appName, type: type });
    } catch {
      console.warn(`IP allocation failed for app: ${appName}, continuing without IP`);
      return null;
    }
  }

  async provision(config: Record<string, unknown>) {
    const appName = crypto.randomUUID();
    const url = `https://${appName}.fly.dev`;
    
    // Create the app using GraphQL
    await this.createApp(appName);
    
    const app = await this.getApp(appName);
    if (!app) {
      throw new Error(`App ${appName} not found`);
    }

    // Allocate the IP
    await this.allocateIp(appName, "shared_v4");

    // Create the machine
    let machine = await this.getMachineByName(appName, "machine");
    
    if (!machine) {
      const machineRequest: CreateMachineRequest = {
        name: "machine",
        region: config.region as string || "ord",
        config: {
          image: constants.DEFAULT_IMAGE,
          env: {
            HOST_URL: url,
            AUTH_TOKEN: await getAuthToken(appName, this.config.jwtPrivateKey),
          },
          guest: {
            cpus: config.cpus as number || 4,
            memory_mb: config.memory_mb as number || 4096,
            cpu_kind: config.cpu_kind as string || "shared",
          },
          services: [{
            autostart: true,
            autostop: "suspend",
            ports: [{
              port: 443,
              handlers: ["http", "tls"]
            }],
            protocol: "tcp",
            internal_port: constants.DEFAULT_SERVER_PORT,
            min_machines_running: 0,
            checks: [{ type: "tcp" }]
          }],
        },
      };
      
      await this.flyRequest(`/apps/${appName}/machines`, "POST", machineRequest as Record<string, unknown>);
      
      // Wait a moment for the machine to be created
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      machine = await this.getMachineByName(appName, "machine");
    }
    
    if (!machine) {
      throw new Error(`Machine not found`);
    }

    // Wait until the machine is healthy
    await this.waitUntilHealthy(appName, machine.id!);
    
    return { resourceId: appName, url };
  }

  async start(resourceId: string) {
    const appName = resourceId;
    const machine = await this.getMachineByName(appName, "machine");
    if (!machine) {
      throw new Error(`Machine not found for app ${appName}`);
    }

    const mutation = `
      mutation StartMachine($appId: ID!, $machineId: String!) {
        startMachine(input: { appId: $appId, id: $machineId }) {
          machine {
            id
            state
          }
        }
      }
    `;
    
    await this.flyGraphqlRequest(mutation, { appId: appName, machineId: machine.id });
    return null;
  }

  async stop(resourceId: string) {
    const appName = resourceId;
    const machine = await this.getMachineByName(appName, "machine");
    if (!machine) {
      throw new Error(`Machine not found for app ${appName}`);
    }

    const mutation = `
      mutation StopMachine($appId: ID!, $machineId: String!) {
        stopMachine(input: { appId: $appId, id: $machineId }) {
          machine {
            id
            state
          }
        }
      }
    `;
    
    await this.flyGraphqlRequest(mutation, { appId: appName, machineId: machine.id });
    return null;
  }

  async restart(resourceId: string) {
    const appName = resourceId;
    const machine = await this.getMachineByName(appName, "machine");
    if (!machine) {
      throw new Error(`Machine not found for app ${appName}`);
    }

    const mutation = `
      mutation RestartMachine($appId: ID!, $machineId: String!) {
        restartMachine(input: { appId: $appId, id: $machineId }) {
          machine {
            id
            state
          }
        }
      }
    `;
    
    await this.flyGraphqlRequest(mutation, { appId: appName, machineId: machine.id });
    return null;
  }

  async remove(resourceId: string) {
    const appName = resourceId;
    await this.flyRequest(`/apps/${appName}`, "DELETE");
    return null;
  }
}
