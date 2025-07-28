import type { Schema, Tool, ToolCallOptions, ToolSet } from "ai";
import { tool } from "ai";
import { z } from "zod";
import type { Agent } from "./index.js";
import type { GenericActionCtx, GenericDataModel } from "convex/server";
import type { ProviderOptions } from "../validators.js";

export type ToolCtx<
  DataModel extends GenericDataModel = GenericDataModel,
  TOOLS extends ToolSet = ToolSet,
> = GenericActionCtx<DataModel> & {
  agent: Agent<TOOLS>;
  userId?: string;
  threadId?: string;
  messageId?: string;
};

/**
 * This is a wrapper around the ai.tool function that adds extra context to the
 * tool call, including the action context, userId, threadId, and messageId.
 * @param tool The tool. See https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
 * but swap parameters for args and handler for execute.
 * @returns A tool to be used with the AI SDK.
 */
export function createTool<
  DataModel extends GenericDataModel,
  TOOLS extends ToolSet,
  INPUT,
  OUTPUT,
>(t: {
  /**
  An optional description of what the tool does.
  Will be used by the language model to decide whether to use the tool.
  Not used for provider-defined tools.
     */
  description?: string;
  /**
  The schema of the input that the tool expects. The language model will use this to generate the input.
  It is also used to validate the output of the language model.
  Use descriptions to make the input understandable for the language model.
     */
  args: ToolParameters<INPUT>;
  /**
  An async function that is called with the arguments from the tool call and produces a result.
  If not provided, the tool will not be executed automatically.

  @args is the input of the tool call.
  @options.abortSignal is a signal that can be used to abort the tool call.
     */
  handler: (
    ctx: ToolCtx<DataModel, TOOLS>,
    args: INPUT,
    options: ToolCallOptions,
  ) => PromiseLike<OUTPUT>;
  /**
   * Provide the context to use, e.g. when defining the tool at runtime.
   */
  ctx?: ToolCtx<DataModel, TOOLS>;
  /**
   * Optional function that is called when the argument streaming starts.
   * Only called when the tool is used in a streaming context.
   */
  onInputStart?: (
    ctx: ToolCtx,
    options: ToolCallOptions,
  ) => void | PromiseLike<void>;
  /**
   * Optional function that is called when an argument streaming delta is available.
   * Only called when the tool is used in a streaming context.
   */
  onInputDelta?: (
    ctx: ToolCtx,
    options: {
      inputTextDelta: string;
    } & ToolCallOptions,
  ) => void | PromiseLike<void>;
  /**
   * Optional function that is called when a tool call can be started,
   * even if the execute function is not provided.
   */
  onInputAvailable?: (
    ctx: ToolCtx,
    options: {
      input: [INPUT] extends [never] ? undefined : INPUT;
    } & ToolCallOptions,
  ) => void | PromiseLike<void>;

  // Extra AI SDK pass-through options.
  providerOptions?: ProviderOptions;
}): Tool<INPUT, OUTPUT> {
  const args = tool({
    type: "function",
    __acceptsCtx: true,
    ctx: t.ctx,
    description: t.description,
    inputSchema: t.args,
    async execute(args: INPUT, options: ToolCallOptions) {
      if (!getCtx(this)) {
        throw new Error(
          "To use a Convex tool, you must either provide the ctx" +
            " at definition time (dynamically in an action), or use the Agent to" +
            " call it (which injects the ctx, userId and threadId)",
        );
      }
      return t.handler(getCtx(this), args, options);
    },
    providerOptions: t.providerOptions,
  });
  if (t.onInputStart) {
    args.onInputStart = t.onInputStart.bind(args, getCtx(args));
  }
  if (t.onInputDelta) {
    args.onInputDelta = t.onInputDelta.bind(args, getCtx(args));
  }
  if (t.onInputAvailable) {
    args.onInputAvailable = t.onInputAvailable.bind(args, getCtx(args));
  }
  return args;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getCtx(tool: any): ToolCtx<any, any> {
  return (tool as { ctx: ToolCtx }).ctx;
}

export function wrapTools(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: ToolCtx<GenericDataModel, any>,
  ...toolSets: (ToolSet | undefined)[]
): ToolSet {
  const output = {} as ToolSet;
  for (const toolSet of toolSets) {
    if (!toolSet) {
      continue;
    }
    for (const [name, tool] of Object.entries(toolSet)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!(tool as any).__acceptsCtx) {
        output[name] = tool;
      } else {
        const out = { ...tool, ctx };
        output[name] = out;
      }
    }
  }
  return output;
}

// Vendoring in from "ai" package since it wasn't exported
type ToolParameters<T> = z.Schema<T> | Schema<T>;
