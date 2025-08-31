import {
  stepCountIs,
  type CallSettings,
  type GenerateObjectResult,
  type IdGenerator,
  type LanguageModel,
  type ModelMessage,
  type StepResult,
  type StopCondition,
  type ToolSet,
} from "ai";
import {
  deserializeMessage,
  serializeNewMessagesInStep,
  serializeObjectResult,
} from "../mapping.js";
import {
  embedMany,
  embedMessages,
  fetchContextMessages,
  generateAndSaveEmbeddings,
} from "./search.js";
import type {
  ActionCtx,
  AgentComponent,
  Config,
  Options,
  RunActionCtx,
  RunMutationCtx,
  UserActionCtx,
} from "./types.js";
import { saveMessages } from "./messages.js";
import type { Message, MessageDoc } from "../validators.js";
import {
  extractText,
  getModelName,
  getProviderName,
  type ModelOrMetadata,
} from "../shared.js";
import { wrapTools, type ToolCtx } from "./createTool.js";
import type { Agent } from "./index.js";
import { assert } from "convex-helpers";
import { inlineMessagesFiles } from "./files.js";
import type { VectorDimension } from "../component/vector/tables.js";

export async function start<
  T,
  Tools extends ToolSet = ToolSet,
  CustomCtx extends object = object,
>(
  ctx: ActionCtx & CustomCtx,
  component: AgentComponent,
  /**
   * These are the arguments you'll pass to the LLM call such as
   * `generateText` or `streamText`. This function will look up the context
   * and provide functions to save the steps, abort the generation, and more.
   * The type of the arguments returned infers from the type of the arguments
   * you pass here.
   */
  {
    messages: argsMessages,
    prompt: argsPrompt,
    promptMessageId: argsPromptMessageId,
    ...args
  }: T & {
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
    tools?: Tools;
    /**
     * The single prompt message to use for the LLM call. This will be the
     * last message in the context. If it's a string, it will be a user role.
     */
    prompt?: string | (ModelMessage | Message)[];
    /**
     * If provided alongside prompt, the ordering will be:
     * 1. system prompt
     * 2. search context
     * 3. recent messages
     * 4. these messages
     * 5. prompt messages, including those already on the same `order` as
     *   the promptMessageId message, if provided.
     */
    messages?: (ModelMessage | Message)[];
    /**
     * The abort signal to be passed to the LLM call. If triggered, it will
     * mark the pending message as failed. If the generation is asynchronously
     * aborted, it will trigger this signal when detected.
     */
    abortSignal?: AbortSignal;
    stopWhen?: StopCondition<Tools> | Array<StopCondition<Tools>>;
    _internal?: { generateId?: IdGenerator };
  },
  {
    threadId,
    ...opts
  }: Options &
    Config & {
      userId?: string | null;
      threadId?: string;
      languageModel: LanguageModel;
      agentName: string;
      agentForToolCtx?: Agent;
    },
): Promise<{
  args: T & {
    system?: string;
    model: LanguageModel;
    messages: ModelMessage[];
    tools?: Tools;
  } & CallSettings;
  order: number;
  stepOrder: number;
  userId: string | undefined;
  promptMessageId: string | undefined;
  updateModel: (model: ModelOrMetadata | undefined) => void;
  save: <TOOLS extends ToolSet>(
    toSave:
      | { step: StepResult<TOOLS> }
      | { object: GenerateObjectResult<unknown> },
    createPendingMessage?: boolean,
  ) => Promise<void>;
  fail: (reason: string) => Promise<void>;
  getSavedMessages: () => MessageDoc[];
}> {
  const model = args.model ?? opts.languageModel;
  const userId =
    opts.userId ??
    (threadId &&
      (await ctx.runQuery(component.threads.getThread, { threadId }))
        ?.userId) ??
    undefined;

  const context = await combineContextWithPrompt(ctx, component, {
    ...opts,
    userId,
    threadId,
    messages: argsMessages,
    prompt: argsPrompt,
    promptMessageId: argsPromptMessageId,
  });

  const { promptMessageId, pendingMessage, savedMessages } =
    await saveInputMessages(ctx, component, {
      ...opts,
      userId,
      threadId,
      prompt: argsPrompt,
      messages: argsMessages,
      promptMessageId: argsPromptMessageId,
    });

  const order = pendingMessage?.order ?? context.order;
  const stepOrder = pendingMessage?.stepOrder ?? context.stepOrder;

  let pendingMessageId = pendingMessage?._id;
  const saveOutput = opts.storageOptions?.saveMessages !== "none";
  let activeModel: ModelOrMetadata = model;
  const fail = async (reason: string) => {
    if (threadId && promptMessageId) {
      console.error(
        `Message failed in thread ${threadId} with promptMessageId ${promptMessageId}: ${reason}`,
      );
    }
    if (pendingMessageId) {
      await ctx.runMutation(component.messages.finalizeMessage, {
        messageId: pendingMessageId,
        result: { status: "failed", error: reason },
      });
    }
  };
  if (args.abortSignal) {
    const abortSignal = args.abortSignal;
    abortSignal.addEventListener(
      "abort",
      async () => {
        await fail(abortSignal.reason ?? "abortSignal");
      },
      { once: true },
    );
  }
  const toolCtx = {
    ...(ctx as UserActionCtx & CustomCtx),
    userId,
    threadId,
    promptMessageId,
    agent: opts.agentForToolCtx,
  } satisfies ToolCtx;
  const tools = wrapTools(toolCtx, args.tools) as Tools;
  const aiArgs = {
    ...opts.callSettings,
    providerOptions: opts.providerOptions,
    ...args,
    model,
    messages: context.messages,
    stopWhen:
      args.stopWhen ?? (opts.maxSteps ? stepCountIs(opts.maxSteps) : undefined),
    tools,
  } as T & {
    model: LanguageModel;
    messages: ModelMessage[];
    tools?: Tools;
    _internal?: { generateId?: IdGenerator };
  } & CallSettings;
  if (pendingMessageId) {
    if (!aiArgs._internal?.generateId) {
      aiArgs._internal = {
        ...aiArgs._internal,
        generateId: pendingMessageId
          ? () => pendingMessageId ?? crypto.randomUUID()
          : undefined,
      };
    }
  }
  return {
    args: aiArgs,
    order: order ?? 0,
    stepOrder: stepOrder ?? 0,
    userId,
    promptMessageId,
    getSavedMessages: () => savedMessages,
    updateModel: (model: ModelOrMetadata | undefined) => {
      if (model) {
        activeModel = model;
      }
    },
    fail,
    save: async <TOOLS extends ToolSet>(
      toSave:
        | { step: StepResult<TOOLS> }
        | { object: GenerateObjectResult<unknown> },
      createPendingMessage?: boolean,
    ) => {
      if (threadId && promptMessageId && saveOutput) {
        const serialized =
          "object" in toSave
            ? await serializeObjectResult(
                ctx,
                component,
                toSave.object,
                activeModel,
              )
            : await serializeNewMessagesInStep(
                ctx,
                component,
                toSave.step,
                activeModel,
              );
        const embeddings = await embedMessages(
          ctx,
          { threadId, ...opts, userId },
          serialized.messages.map((m) => m.message),
        );
        if (createPendingMessage) {
          serialized.messages.push({
            message: { role: "assistant", content: [] },
            status: "pending",
          });
          embeddings?.vectors.push(null);
        }
        const saved = await ctx.runMutation(component.messages.addMessages, {
          userId,
          threadId,
          agentName: opts.agentName,
          promptMessageId,
          pendingMessageId,
          messages: serialized.messages,
          embeddings,
          failPendingSteps: false,
        });
        const lastMessage = saved.messages.at(-1)!;
        if (createPendingMessage) {
          if (lastMessage.status === "failed") {
            pendingMessageId = undefined;
            savedMessages.push(...saved.messages);
            await fail(
              lastMessage.error ??
                "Aborting - the pending message was marked as failed",
            );
          } else {
            pendingMessageId = lastMessage._id;
            savedMessages.push(...saved.messages.slice(0, -1));
          }
        } else {
          pendingMessageId = undefined;
          savedMessages.push(...saved.messages);
        }
      }
      const output = "object" in toSave ? toSave.object : toSave.step;
      if (opts.rawRequestResponseHandler) {
        await opts.rawRequestResponseHandler(ctx, {
          userId,
          threadId,
          agentName: opts.agentName,
          request: output.request,
          response: output.response,
        });
      }
      if (opts.usageHandler && output.usage) {
        await opts.usageHandler(ctx, {
          userId,
          threadId,
          agentName: opts.agentName,
          model: getModelName(activeModel),
          provider: getProviderName(activeModel),
          usage: output.usage,
          providerMetadata: output.providerMetadata,
        });
      }
    },
  };
}

async function combineContextWithPrompt(
  ctx: RunActionCtx,
  component: AgentComponent,
  args: {
    prompt: string | (ModelMessage | Message)[] | undefined;
    messages: (ModelMessage | Message)[] | undefined;
    promptMessageId: string | undefined;
    userId: string | undefined;
    threadId: string | undefined;
    agentName?: string;
  } & Options &
    Config,
): Promise<{
  messages: ModelMessage[];
  order: number | undefined;
  stepOrder: number | undefined;
}> {
  const { threadId, userId, textEmbeddingModel } = args;

  const promptArray = getPromptArray(args.prompt);

  // If only a messageId is provided, this will add that message to the end.
  const searchMsg =
    promptArray.at(-1) ??
    (args.promptMessageId ? undefined : args.messages?.at(-1));
  const searchText = searchMsg ? extractText(searchMsg) : undefined;

  const contextMessages: MessageDoc[] = await fetchContextMessages(
    ctx,
    component,
    {
      userId,
      threadId,
      targetMessageId: args.promptMessageId,
      searchText,
      contextOptions: args.contextOptions ?? {},
      getEmbedding: async (text) => {
        assert(
          textEmbeddingModel,
          "A textEmbeddingModel is required to be set on the Agent that you're doing vector search with",
        );
        return {
          embedding: (
            await embedMany(ctx, {
              ...args,
              userId,
              values: [text],
              textEmbeddingModel,
            })
          ).embeddings[0],
          textEmbeddingModel,
        };
      },
    },
  );

  const promptMessageIndex = args.promptMessageId
    ? contextMessages.findIndex((m) => m._id === args.promptMessageId)
    : -1;
  const promptMessage =
    promptMessageIndex !== -1 ? contextMessages[promptMessageIndex] : undefined;
  let prePromptDocs = contextMessages;
  const messages = args.messages ?? [];
  let existingResponseDocs: MessageDoc[] = [];
  if (promptMessage) {
    prePromptDocs = contextMessages.slice(0, promptMessageIndex);
    existingResponseDocs = contextMessages.slice(promptMessageIndex + 1);
    if (promptArray.length === 0) {
      // If they didn't override the prompt, use the existing prompt message.
      if (promptMessage.message) {
        promptArray.push(promptMessage.message);
      }
    }
    if (!promptMessage.embeddingId && textEmbeddingModel) {
      // Lazily generate embeddings for the prompt message, if it doesn't have
      // embeddings yet. This can happen if the message was saved in a mutation
      // where the LLM is not available.
      await generateAndSaveEmbeddings(
        ctx,
        component,
        {
          ...args,
          userId,
          textEmbeddingModel,
        },
        [promptMessage],
      );
    }
  }

  let processedMessages: ModelMessage[] = [
    ...prePromptDocs.map((m) => m.message),
    ...messages,
    ...promptArray,
    ...existingResponseDocs.map((m) => m.message),
  ]
    .filter((m) => !!m)
    .map((m) => deserializeMessage(m));

  // Process messages to inline localhost files (if not, file urls pointing to localhost will be sent to LLM providers)
  if (process.env.CONVEX_CLOUD_URL?.startsWith("http://127.0.0.1")) {
    processedMessages = await inlineMessagesFiles(processedMessages);
  }

  return {
    messages: processedMessages,
    order: promptMessage?.order,
    stepOrder: promptMessage?.stepOrder,
  };
}

function getPromptArray(
  prompt: string | (ModelMessage | Message)[] | undefined,
): (ModelMessage | Message)[] {
  return !prompt
    ? []
    : Array.isArray(prompt)
      ? prompt
      : [{ role: "user", content: prompt }];
}

async function saveInputMessages(
  ctx: RunMutationCtx | RunActionCtx,
  component: AgentComponent,
  {
    threadId,
    userId,
    prompt,
    messages,
    ...args
  }: {
    prompt: string | (ModelMessage | Message)[] | undefined;
    messages: (ModelMessage | Message)[] | undefined;
    promptMessageId: string | undefined;
    userId: string | undefined;
    threadId: string | undefined;
    agentName?: string;
  } & Pick<
    Config,
    "usageHandler" | "textEmbeddingModel" | "callSettings" | "storageOptions"
  >,
): Promise<{
  promptMessageId: string | undefined;
  pendingMessage: MessageDoc | undefined;
  savedMessages: MessageDoc[];
}> {
  const shouldSave = args.storageOptions?.saveMessages ?? "promptAndOutput";
  // If only a promptMessageId is provided, this will be empty.
  const promptArray = getPromptArray(prompt);

  if (!threadId || shouldSave === "none") {
    return {
      promptMessageId: args.promptMessageId,
      pendingMessage: undefined,
      savedMessages: [],
    };
  }

  const toSave: (ModelMessage | Message)[] = [];
  if (args.promptMessageId) {
    // We don't save any inputs if a promptMessageId is provided.
    // It's unclear where they'd want to save the new messages.
  } else if (shouldSave === "all") {
    if (messages) toSave.push(...messages);
    toSave.push(...promptArray);
  } else {
    if (promptArray.length) {
      // We treat the whole promptArray as the prompt message to save.
      toSave.push(...promptArray);
    } else if (messages) {
      // Otherwise, treat the last message as the prompt message to save.
      toSave.push(...messages.slice(-1));
    }
  }
  let embeddings:
    | {
        vectors: (number[] | null)[];
        dimension: VectorDimension;
        model: string;
      }
    | undefined;
  if (args.textEmbeddingModel && toSave.length) {
    assert(
      "runAction" in ctx,
      "You must be in an action context to generate embeddings",
    );
    embeddings = await embedMessages(
      ctx,
      { ...args, userId: userId ?? undefined, threadId },
      toSave,
    );
    if (embeddings) {
      // for the pending message
      embeddings.vectors.push(null);
    }
  }
  const saved = await saveMessages(ctx, component, {
    threadId,
    userId,
    messages: [...toSave, { role: "assistant", content: [] }],
    metadata: [
      ...Array.from({ length: toSave.length }, () => ({})),
      { status: "pending" },
    ],
    failPendingSteps: !!args.promptMessageId,
    embeddings,
  });
  return {
    promptMessageId: toSave.length
      ? saved.messages.at(-2)!._id
      : args.promptMessageId,
    pendingMessage: saved.messages.at(-1)!,
    savedMessages: saved.messages.slice(0, -1),
  };
}
