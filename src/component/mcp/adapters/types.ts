import type { Doc } from "../../_generated/dataModel.js";

export interface MCPAdapter {
  readonly name: string;
  readonly config: Record<string, unknown> | undefined;
  provision(request: Doc<"mcps">, config: Record<string, unknown>): Promise<string>;
  start(request: Doc<"mcps">): Promise<null>;
  stop(request: Doc<"mcps">): Promise<null>;
  restart(request: Doc<"mcps">): Promise<null>;
  remove(request: Doc<"mcps">): Promise<null>;
}
