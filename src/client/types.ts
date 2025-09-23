import type {
  InferSchema,
  ModelMessage,
  ProviderOptions,
  Schema,
} from "@ai-sdk/provider-utils";
import type { JSONValue } from "@ai-sdk/provider";
import type {
  EmbeddingModel,
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
  RepairTextFunction,
  TelemetrySettings,
  CallSettings,
  Prompt,
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
import type {
  MessageDoc,
  ProviderMetadata,
  StreamDelta,
  StreamMessage,
  ThreadDoc,
  MCPAdapterConfig,
} from "../validators.js";
import type { StreamingOptions } from "./streaming.js";
import type * as z3 from "zod/v3";
import type * as z4 from "zod/v4";

export type Config = {
  /**
   * The LLM model to use for generating / streaming text and objects.
   * e.g.
   * import { openai } from "@ai-sdk/openai"
   * const myAgent = new Agent(components.agent, {
   *   languageModel: openai.chat("gpt-4o-mini"),
   */
  languageModel?: LanguageModel;
  /**
   * The model to use for text embeddings. Optional.
   * If specified, it will use this for generating vector embeddings
   * of chats, and can opt-in to doing vector search for automatic context
   * on generateText, etc.
   * e.g.
   * import { openai } from "@ai-sdk/openai"
   * const myAgent = new Agent(components.agent, {
   *   ...
   *   textEmbeddingModel: openai.embedding("text-embedding-3-small")
   */
  textEmbeddingModel?: EmbeddingModel<string>;
  /**
   * Options to determine what messages are included as context in message
   * generation. To disable any messages automatically being added, pass:
   * { recentMessages: 0 }
   */
  contextOptions?: ContextOptions;
  /**
   * Determines whether messages are automatically stored when passed as
   * arguments or generated.
   */
  storageOptions?: StorageOptions;
  /**
   * The usage handler to use for this agent.
   */
  usageHandler?: UsageHandler;
  /**
   * By default, messages are ordered with context in `fetchContextWithPrompt`,
   * but you can override this by providing a context handler. Here you can
   * filter, modify, or enrich the context messages. If provided, the default
   * ordering will not apply. This excludes the system message / instructions.
   *
   * Default ordering (when no contextHandler provided):
   * 1) search results
   * 2) core memory (system messages)
   * 3) recent thread messages
   * 4) input messages (args.messages)
   * 5) input prompt (args.prompt)
   * 6) existing responses (same order as promptMessageId)
   */
  contextHandler?: ContextHandler;
  /**
   * Called for each LLM request/response, so you can do things like
   * log the raw request body or response headers to a table, or logs.
   */
  rawRequestResponseHandler?: RawRequestResponseHandler;
  /**
   * @deprecated Reach out if you use this. Otherwise will be removed soon.
   * Default provider options to pass for the LLM calls.
   * This can be overridden at each generate/stream callsite on a per-field
   * basis. To clear a default setting, you'll need to pass `undefined`.
   */
  providerOptions?: ProviderOptions;
  /**
   * The default settings to use for the LLM calls.
   * This can be overridden at each generate/stream callsite on a per-field
   * basis. To clear a default setting, you'll need to pass `undefined`.
   */
  callSettings?: CallSettings;
  /**
   * The maximum number of steps to allow for a single generation.
   *
   * For example, if an agent wants to call a tool, that call and tool response
   * will be one step. Generating a response based on the tool call & response
   * will be a second step.
   * If it runs out of steps, it will return the last step result, which may
   * not be an assistant message.

   * This becomes the default value when `stopWhen` is not specified in the
   * Agent or generation callsite.
   * AI SDK v5 removed the `maxSteps` argument, but this is kept here for
   * convenience and backwards compatibility.
   * Defaults to 1.
   */
  maxSteps?: number;
  /**
   * Whether to automatically include memory tools (memory_rethink, memory_append, 
   * memory_replace, message_search) when an embedding model is available.
   * Memory tools allow the agent to manage core memory and search through
   * message history using semantic search.
   * Defaults to false.
   */
  memoryTools?: boolean;
  /**
   * Whether to automatically include MCP tools when an MCP is available (provisioned).
   * This doesn't automatically provision an MCP, it just includes the tools if one is available.
   * Defaults to false.
   */
  mcpConfig?: MCPAdapterConfig;
};

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
  /**
   * @deprecated Use promptMessageId instead.
   * The ID of the prompt message for the generation.
   */
  messageId?: string;
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

/**
 * By default, messages are ordered with context in `fetchContextWithPrompt`,
 * but you can override this by providing a context handler. Here you can filter
 * out, add in, or reorder messages.
 */
export type ContextHandler = (
  ctx: RunActionCtx,
  args: {
    /**
     * The messages fetched from search.
     */
    search: ModelMessage[];
    /**
     * The recent messages already in the thread history,
     * excluding any messages that came after promptMessageId.
     */
    recent: ModelMessage[];
    /**
     * The messages passed as the `messages` argument to e.g. generateText.
     */
    inputMessages: ModelMessage[];
    /**
     * The message(s) passed as the `prompt` argument to e.g. generateText.
     * Otherwise, if `promptMessageId` was provided, the message at that id.
     * `prompt` will override the message at `promptMessageId`.
     */
    inputPrompt: ModelMessage[];
    /**
     * Any messages on the same `order` as the promptMessageId message after the
     * prompt message. These are presumably existing responses to the prompt
     * message.
     */
    existingResponses: ModelMessage[];
    /**
     * Core memory messages for the user, injected as system messages.
     */
    coreMemory: ModelMessage[];
    /**
     * The user associated with the generation, if any.
     */
    userId: string | undefined;
    /**
     * The thread associated with the generation, if any.
     */
    threadId: string | undefined;
  },
) => ModelMessage[] | Promise<ModelMessage[]>;

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
export type ObjectSchema = z3.Schema | z4.core.$ZodType | Schema;
export type DefaultObjectSchema = z4.core.$ZodType<JSONValue>;

/**
 * Due to some issues with the type inference of the ai sdk, we need to
 * manually type the arguments for the generateObject function.
 * This is a workaround to allow the model to be optional.
 */
export type GenerateObjectArgs<
  SCHEMA extends ObjectSchema = DefaultObjectSchema,
  OUTPUT extends ObjectMode = InferSchema<SCHEMA> extends string
    ? "enum"
    : "object",
  RESULT = OUTPUT extends "array"
    ? Array<InferSchema<SCHEMA>>
    : InferSchema<SCHEMA>,
> = Omit<CallSettings, "stopSequences"> &
  Partial<Prompt> & {
    /**
     * If provided, this message will be used as the "prompt" for the LLM call,
     * instead of the prompt or messages.
     * This is useful if you want to first save a user message, then use it as
     * the prompt for the LLM call in another call.
     */
    promptMessageId?: string;
  } & (OUTPUT extends "enum"
    ? {
        /**
The enum values that the model should use.
*/
        enum: Array<RESULT>;
        mode?: "json";
        output: "enum";
      }
    : OUTPUT extends "no-schema"
      ? // eslint-disable-next-line @typescript-eslint/no-empty-object-type
        {}
      : {
          /**
The schema of the object that the model should generate.
*/
          schema: SCHEMA;
          /**
Optional name of the output that should be generated.
Used by some providers for additional LLM guidance, e.g.
via tool or schema name.
*/
          schemaName?: string;
          /**
Optional description of the output that should be generated.
Used by some providers for additional LLM guidance, e.g.
via tool or schema description.
*/
          schemaDescription?: string;
          /**
The mode to use for object generation.

The schema is converted into a JSON schema and used in one of the following ways

- 'auto': The provider will choose the best mode for the model.
- 'tool': A tool with the JSON schema as parameters is provided and the provider is instructed to use it.
- 'json': The JSON schema and an instruction are injected into the prompt. If the provider supports JSON mode, it is enabled. If the provider supports JSON grammars, the grammar is used.

Please note that most providers do not support all modes.

Default and recommended: 'auto' (best mode for the model).
*/
          mode?: "auto" | "json" | "tool";
        }) & {
    output?: OUTPUT;
    /**
The language model to use.
   */
    model?: LanguageModel;
    /**
A function that attempts to repair the raw output of the model
to enable JSON parsing.
   */
    experimental_repairText?: RepairTextFunction;
    /**
Optional telemetry configuration (experimental).
     */
    experimental_telemetry?: TelemetrySettings;
    /**
Additional provider-specific options. They are passed through
to the provider from the AI SDK and enable provider-specific
functionality that can be fully encapsulated in the provider.
*/
    providerOptions?: ProviderOptions;
    /**
     * Internal. For test use only. May change without notice.
     */
    _internal?: { generateId?: () => string; currentDate?: () => Date };
  };

export type StreamObjectArgs<
  SCHEMA extends ObjectSchema = DefaultObjectSchema,
  OUTPUT extends ObjectMode = InferSchema<SCHEMA> extends string
    ? "enum"
    : "object",
  RESULT = OUTPUT extends "array"
    ? Array<InferSchema<SCHEMA>>
    : InferSchema<SCHEMA>,
> = GenerateObjectArgs<SCHEMA, OUTPUT, RESULT> &
  Pick<
    Parameters<typeof streamObject<SCHEMA, OUTPUT, RESULT>>[0],
    "onError" | "onFinish" | "_internal"
  >;

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
    > & {
      /**
       * If provided, this message will be used as the "prompt" for the LLM call,
       * instead of the prompt or messages.
       * This is useful if you want to first save a user message, then use it as
       * the prompt for the LLM call in another call.
       */
      promptMessageId?: string;
    },
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
    > & {
      /**
       * If provided, this message will be used as the "prompt" for the LLM call,
       * instead of the prompt or messages.
       * This is useful if you want to first save a user message, then use it as
       * the prompt for the LLM call in another call.
       */
      promptMessageId?: string;
    },
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
  generateObject<
    SCHEMA extends ObjectSchema = DefaultObjectSchema,
    OUTPUT extends ObjectMode = InferSchema<SCHEMA> extends string
      ? "enum"
      : "object",
    RESULT = OUTPUT extends "array"
      ? Array<InferSchema<SCHEMA>>
      : InferSchema<SCHEMA>,
  >(
    generateObjectArgs: GenerateObjectArgs<SCHEMA, OUTPUT, RESULT> & {
      /**
       * If provided, this message will be used as the "prompt" for the LLM call,
       * instead of the prompt or messages.
       * This is useful if you want to first save a user message, then use it as
       * the prompt for the LLM call in another call.
       */
      promptMessageId?: string;
    },
    options?: Options,
  ): Promise<GenerateObjectResult<RESULT> & ThreadOutputMetadata>;
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
  streamObject<
    SCHEMA extends ObjectSchema = DefaultObjectSchema,
    OUTPUT extends ObjectMode = InferSchema<SCHEMA> extends string
      ? "enum"
      : "object",
    RESULT = OUTPUT extends "array"
      ? Array<InferSchema<SCHEMA>>
      : InferSchema<SCHEMA>,
  >(
    /**
     * The same arguments you'd pass to "ai" sdk {@link streamObject}.
     */
    streamObjectArgs: StreamObjectArgs<SCHEMA, OUTPUT, RESULT> & {
      /**
       * If provided, this message will be used as the "prompt" for the LLM call,
       * instead of the prompt or messages.
       * This is useful if you want to first save a user message, then use it as
       * the prompt for the LLM call in another call.
       */
      promptMessageId?: string;
    },
    options?: Options,
  ): Promise<
    ReturnType<typeof streamObject<SCHEMA, OUTPUT, RESULT>> &
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
  /**
   * By default, messages are ordered with context in `fetchContextWithPrompt`,
   * but you can override this by providing a context handler. Here you can
   * filter, modify, or enrich the context messages. If provided, the default
   * ordering will not apply. This excludes the system message / instructions.
   *
   * Default ordering (when no contextHandler provided):
   * 1) search results
   * 2) core memory (system messages)
   * 3) recent thread messages
   * 4) input messages (args.messages)
   * 5) input prompt (args.prompt)
   * 6) existing responses (same order as promptMessageId)
   */
  contextHandler?: ContextHandler;
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
