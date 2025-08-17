import type { FlexibleSchema } from "@ai-sdk/provider-utils";
import type {
  generateObject,
  GenerateObjectResult,
  generateText,
  GenerateTextResult,
  LanguageModelRequestMetadata,
  LanguageModelResponseMetadata,
  LanguageModelUsage,
  LanguageModel,
  streamObject,
  streamText,
  StreamTextResult,
  ToolChoice,
  ToolSet,
} from "ai";
import type {
  Auth,
  Expand,
  FunctionArgs,
  FunctionReference,
  FunctionReturnType,
  GenericActionCtx,
  GenericDataModel,
  StorageActionWriter,
  StorageReader,
  WithoutSystemFields,
} from "convex/server";
import type { GenericId } from "convex/values";
import type { Mounts } from "../component/_generated/api.js";
import type { MessageDoc, ThreadDoc } from "../component/schema.js";
import type {
  ProviderMetadata,
  StreamDelta,
  StreamMessage,
} from "../validators.js";
import type { StreamingOptions } from "./streaming.js";

/**
 * Options to configure what messages are fetched as context,
 * automatically with thread.generateText, or directly via search.
 */
export type ContextOptions = {
  /**
   * Whether to include tool messages in the context.
   * By default, tool calls and results are not included.
   */
  excludeToolMessages?: boolean;
  /**
   * How many recent messages to include. These are added after the search
   * messages, and do not count against the search limit.
   * Default: 100
   */
  recentMessages?: number;
  /**
   * Options for searching messages.
   */
  searchOptions?: {
    /**
     * The maximum number of messages to fetch. Default is 10.
     */
    limit: number;
    /**
     * Whether to use text search to find messages. Default is false.
     */
    textSearch?: boolean;
    /**
     * Whether to use vector search to find messages. Default is false.
     * At least one of textSearch or vectorSearch must be true.
     */
    vectorSearch?: boolean;
    /**
     * The score threshold for vector search. Default is 0.0.
     */
    vectorScoreThreshold?: number;
    /**
     * What messages around the search results to include.
     * Default: { before: 2, after: 1 }
     * (two before, and one after each message found in the search)
     * Note, this is after the limit is applied.
     * By default this will quadruple the number of messages fetched.
     */
    messageRange?: { before: number; after: number };
  };
  /**
   * Whether to search across other threads for relevant messages.
   * By default, only the current thread is searched.
   */
  searchOtherThreads?: boolean;
};

/**
 * Options to configure the automatic saving of messages
 * when generating text / objects in a thread.
 */
export type StorageOptions = {
  /**
   * Whether to save messages to the thread history.
   * Pass "all" to save all input and output messages.
   * Pass "none" to not save any input or output messages.
   * Pass "promptAndOutput" to save the prompt and all output messages.
   * If you pass {messages} but no {prompt}, it will assume messages.at(-1) is
   * the prompt.
   * Defaults to "promptAndOutput".
   */
  saveMessages?: "all" | "none" | "promptAndOutput";
};

export type GenerationOutputMetadata = {
  /**
   * The ID of the prompt message for the generation.
   */
  promptMessageId?: string;
  /**
   * The order of the prompt message and responses for the generation.
   * Each order starts with a user message, then followed by agent responses.
   * If a promptMessageId is provided, that dictates the order.
   */
  order?: number;
  /**
   * The messages saved for the generation - both saved input and output.
   * If you passed promptMessageId, it will not include that message.
   */
  savedMessages?: MessageDoc[];
};

export type UsageHandler = (
  ctx: RunActionCtx,
  args: {
    userId: string | undefined;
    threadId: string | undefined;
    agentName: string | undefined;
    usage: LanguageModelUsage;
    // Often has more information, like cached token usage in the case of openai.
    providerMetadata: ProviderMetadata | undefined;
    model: string;
    provider: string;
  },
) => void | Promise<void>;

export type RawRequestResponseHandler = (
  ctx: ActionCtx,
  args: {
    userId: string | undefined;
    threadId: string | undefined;
    agentName: string | undefined;
    request: LanguageModelRequestMetadata;
    response: LanguageModelResponseMetadata;
  },
) => void | Promise<void>;

export type AgentComponent = UseApi<Mounts>;

export type TextArgs<
  AgentTools extends ToolSet,
  TOOLS extends ToolSet | undefined = undefined,
  OUTPUT = never,
  OUTPUT_PARTIAL = never,
> = Omit<
  Parameters<
    typeof generateText<
      TOOLS extends undefined ? AgentTools : TOOLS,
      OUTPUT,
      OUTPUT_PARTIAL
    >
  >[0],
  "toolChoice" | "tools" | "model"
> & {
  /**
   * If provided, this message will be used as the "prompt" for the LLM call,
   * instead of the prompt or messages.
   * This is useful if you want to first save a user message, then use it as
   * the prompt for the LLM call in another call.
   */
  promptMessageId?: string;
  /**
   * The model to use for the LLM calls. This will override the model specified
   * in the Agent constructor.
   */
  model?: LanguageModel;
  /**
   * The tools to use for the tool calls. This will override tools specified
   * in the Agent constructor or createThread / continueThread.
   */
  tools?: TOOLS;
  /**
   * The tool choice to use for the tool calls. This must be one of the tools
   * specified in the tools array. e.g. {toolName: "getWeather", type: "tool"}
   */
  toolChoice?: ToolChoice<TOOLS extends undefined ? AgentTools : TOOLS>;
};

export type StreamingTextArgs<
  AgentTools extends ToolSet,
  TOOLS extends ToolSet | undefined = undefined,
  OUTPUT = never,
  OUTPUT_PARTIAL = never,
> = Omit<
  Parameters<
    typeof streamText<
      TOOLS extends undefined ? AgentTools : TOOLS,
      OUTPUT,
      OUTPUT_PARTIAL
    >
  >[0],
  "toolChoice" | "tools" | "model"
> & {
  /**
   * If provided, this message will be used as the "prompt" for the LLM call,
   * instead of the prompt or messages.
   * This is useful if you want to first save a user message, then use it as
   * the prompt for the LLM call in another call.
   */
  promptMessageId?: string;
  /**
   * The model to use for the tool calls. This will override the model specified
   * in the Agent constructor.
   */
  model?: LanguageModel;
  /**
   * The tools to use for the tool calls. This will override tools specified
   * in the Agent constructor or createThread / continueThread.
   */
  tools?: TOOLS;
  /**
   * The tool choice to use for the tool calls. This must be one of the tools
   * specified in the tools array. e.g. {toolName: "getWeather", type: "tool"}
   */
  toolChoice?: ToolChoice<TOOLS extends undefined ? AgentTools : TOOLS>;
};

export type ObjectMode = "object" | "array" | "enum" | "no-schema";

export type MaybeCustomCtx<
  CustomCtx,
  DataModel extends GenericDataModel,
  AgentTools extends ToolSet,
> =
  CustomCtx extends Record<string, unknown>
    ? {
        /**
         * If you have a custom ctx that you use with the Agent
         * (e.g. new Agent<{ orgId: string }>(...))
         * you need to provide this function to add any extra fields.
         * e.g.
         * ```ts
         * const myAgent = new Agent<{ orgId: string }>(...);
         * const myAction = myAgent.asTextAction({
         *   customCtx: (ctx: ActionCtx, target, llmArgs) => {
         *     const orgId = await lookupOrgId(ctx, target.threadId);
         *     return { orgId };
         *   },
         * });
         * ```
         * Then, in your tools, you can
         */
        customCtx: (
          ctx: GenericActionCtx<DataModel>,
          target: {
            userId?: string | undefined;
            threadId?: string | undefined;
          },
          llmArgs: TextArgs<AgentTools>,
        ) => CustomCtx;
      }
    : { customCtx?: never };

type ThreadOutputMetadata = Required<GenerationOutputMetadata>;

/**
 * The interface for a thread returned from {@link createThread} or {@link continueThread}.
 * This is contextual to a thread and/or user.
 */
export interface Thread<DefaultTools extends ToolSet> {
  /**
   * The target threadId, from the startThread or continueThread initializers.
   */
  threadId: string;
  /**
   * Get the metadata for the thread.
   */
  getMetadata: () => Promise<ThreadDoc>;
  /**
   * Update the metadata for the thread.
   */
  updateMetadata: (
    patch: Partial<WithoutSystemFields<ThreadDoc>>,
  ) => Promise<ThreadDoc>;
  /**
   * This behaves like {@link generateText} from the "ai" package except that
   * it add context based on the userId and threadId and saves the input and
   * resulting messages to the thread, if specified.
   * Use {@link continueThread} to get a version of this function already scoped
   * to a thread (and optionally userId).
   * @param args The arguments to the generateText function, along with extra controls
   * for the {@link ContextOptions} and {@link StorageOptions}.
   * @returns The result of the generateText function.
   */
  generateText<
    TOOLS extends ToolSet | undefined = undefined,
    OUTPUT = never,
    OUTPUT_PARTIAL = never,
  >(
    generateTextArgs: TextArgs<
      TOOLS extends undefined ? DefaultTools : TOOLS,
      TOOLS,
      OUTPUT,
      OUTPUT_PARTIAL
    >,
    options?: Options,
  ): Promise<
    GenerateTextResult<TOOLS extends undefined ? DefaultTools : TOOLS, OUTPUT> &
      ThreadOutputMetadata
  >;

  /**
   * This behaves like {@link streamText} from the "ai" package except that
   * it add context based on the userId and threadId and saves the input and
   * resulting messages to the thread, if specified.
   * Use {@link continueThread} to get a version of this function already scoped
   * to a thread (and optionally userId).
   * @param args The arguments to the streamText function, along with extra controls
   * for the {@link ContextOptions} and {@link StorageOptions}.
   * @returns The result of the streamText function.
   */
  streamText<
    TOOLS extends ToolSet | undefined = undefined,
    OUTPUT = never,
    PARTIAL_OUTPUT = never,
  >(
    streamTextArgs: StreamingTextArgs<
      TOOLS extends undefined ? DefaultTools : TOOLS,
      TOOLS,
      OUTPUT,
      PARTIAL_OUTPUT
    >,
    options?: Options & {
      /**
       * Whether to save incremental data (deltas) from streaming responses.
       * Defaults to false.
       * If false, it will not save any deltas to the database.
       * If true, it will save deltas with {@link DEFAULT_STREAMING_OPTIONS}.
       *
       * Regardless of this option, when streaming you are able to use this
       * `streamText` function as you would with the "ai" package's version:
       * iterating over the text, streaming it over HTTP, etc.
       */
      saveStreamDeltas?: boolean | StreamingOptions;
    },
  ): Promise<
    StreamTextResult<
      TOOLS extends undefined ? DefaultTools : TOOLS,
      PARTIAL_OUTPUT
    > &
      ThreadOutputMetadata
  >;
  /**
   * This behaves like {@link generateObject} from the "ai" package except that
   * it add context based on the userId and threadId and saves the input and
   * resulting messages to the thread, if specified. This overload is for objects, arrays, and enums.
   * Use {@link continueThread} to get a version of this function already scoped
   * to a thread (and optionally userId).
   * @param args The arguments to the generateObject function, along with extra controls
   * for the {@link ContextOptions} and {@link StorageOptions}.
   * @returns The result of the generateObject function.
   */
  generateObject<T, Mode extends ObjectMode = "object">(
    generateObjectArgs: Omit<
      Parameters<typeof generateObject<FlexibleSchema<T>, Mode>>[0],
      "model"
    > & {
      /**
       * If provided, this message will be used as the "prompt" for the LLM call,
       * instead of the prompt or messages.
       * This is useful if you want to first save a user message, then use it as
       * the prompt for the LLM call in another call.
       */
      promptMessageId?: string;
      /**
       * The model to use for the LLM calls. This will override the model specified
       * in the Agent constructor.
       */
      model?: LanguageModel;
      /**
       * The tools to use for the tool calls. This will override tools specified
       * in the Agent constructor or createThread / continueThread.
       */
    },
    options?: Options,
  ): Promise<GenerateObjectResult<T> & ThreadOutputMetadata>;
  /**
   * This behaves like {@link streamObject} from the "ai" package except that
   * it add context based on the userId and threadId and saves the input and
   * resulting messages to the thread, if specified.
   * Use {@link continueThread} to get a version of this function already scoped
   * to a thread (and optionally userId).
   * @param args The arguments to the streamObject function, along with extra controls
   * for the {@link ContextOptions} and {@link StorageOptions}.
   * @returns The result of the streamObject function.
   */
  streamObject<T extends FlexibleSchema<T>, Mode extends ObjectMode = "object">(
    /**
     * The same arguments you'd pass to "ai" sdk {@link streamObject}.
     */
    streamObjectArgs: Omit<
      Parameters<typeof streamObject<FlexibleSchema<T>, Mode>>[0],
      "model"
    > & {
      /**
       * If provided, this message will be used as the "prompt" for the LLM call,
       * instead of the prompt or messages.
       * This is useful if you want to first save a user message, then use it as
       * the prompt for the LLM call in another call.
       */
      promptMessageId?: string;
      /**
       * The model to use for the LLM calls. This will override the model specified
       * in the Agent constructor.
       */
      model?: LanguageModel;
      /**
       * The tools to use for the tool calls. This will override tools specified
       * in the Agent constructor or createThread / continueThread.
       */
    },
    options?: Options,
  ): Promise<
    ReturnType<typeof streamObject<FlexibleSchema<T>, Mode>> &
      ThreadOutputMetadata
  >;
}

export type Options = {
  /**
   * The context options to use for passing in message history to the LLM.
   */
  contextOptions?: ContextOptions;
  /**
   * The storage options to use for saving the input and output messages to the thread.
   */
  storageOptions?: StorageOptions;
  /**
   * The usage handler to use for this thread. Overrides any handler
   * set in the agent constructor.
   */
  usageHandler?: UsageHandler;
};

export type SyncStreamsReturnValue =
  | { kind: "list"; messages: StreamMessage[] }
  | { kind: "deltas"; deltas: StreamDelta[] }
  | undefined;

/* Type utils follow */
export type RunQueryCtx = {
  runQuery: <Query extends FunctionReference<"query", "internal">>(
    query: Query,
    args: FunctionArgs<Query>,
  ) => Promise<FunctionReturnType<Query>>;
};
export type RunMutationCtx = RunQueryCtx & {
  runMutation: <Mutation extends FunctionReference<"mutation", "internal">>(
    mutation: Mutation,
    args: FunctionArgs<Mutation>,
  ) => Promise<FunctionReturnType<Mutation>>;
};
export type RunActionCtx = RunMutationCtx & {
  runAction<Action extends FunctionReference<"action", "internal">>(
    action: Action,
    args: FunctionArgs<Action>,
  ): Promise<FunctionReturnType<Action>>;
};
export type UserActionCtx = GenericActionCtx<GenericDataModel>;
export type ActionCtx = RunActionCtx & {
  auth: Auth;
  storage: StorageActionWriter;
};
export type QueryCtx = RunQueryCtx & { storage: StorageReader };

export type OpaqueIds<T> =
  T extends GenericId<infer _T>
    ? string
    : T extends (infer U)[]
      ? OpaqueIds<U>[]
      : T extends ArrayBuffer
        ? ArrayBuffer
        : T extends object
          ? { [K in keyof T]: OpaqueIds<T[K]> }
          : T;

export type UseApi<API> = Expand<{
  [mod in keyof API]: API[mod] extends FunctionReference<
    infer FType,
    "public",
    infer FArgs,
    infer FReturnType,
    infer FComponentPath
  >
    ? FunctionReference<
        FType,
        "internal",
        OpaqueIds<FArgs>,
        OpaqueIds<FReturnType>,
        FComponentPath
      >
    : UseApi<API[mod]>;
}>;
