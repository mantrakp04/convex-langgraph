export interface MCPAdapter {
  readonly name: string;
  readonly config: Record<string, unknown> | undefined;
  provision(config: Record<string, unknown>): Promise<{ resourceId: string, url: string }>;
  start(resourceId: string): Promise<null>;
  stop(resourceId: string): Promise<null>;
  restart(resourceId: string): Promise<null>;
  remove(resourceId: string): Promise<null>;
}
