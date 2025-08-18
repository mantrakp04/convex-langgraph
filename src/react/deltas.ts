import type { TextStreamPart, ToolSet } from "ai";
import type { MessageDoc } from "../client/index.js";
import type {
  Message,
  MessageStatus,
  StreamDelta,
  StreamMessage,
  vReasoningPart,
  vTextPart,
  vToolCallPart,
  vToolResultPart,
} from "../validators.js";
import type { Infer } from "convex/values";

export function mergeDeltas(
  threadId: string,
  streamMessages: StreamMessage[],
  existingStreams: Array<{
    streamId: string;
    cursor: number;
    messages: MessageDoc[];
  }>,
  allDeltas: StreamDelta[],
): [
  MessageDoc[],
  Array<{ streamId: string; cursor: number; messages: MessageDoc[] }>,
  boolean,
] {
  const newStreams: Array<{
    streamId: string;
    cursor: number;
    messages: MessageDoc[];
  }> = [];
  // Seed the existing chunks
  let changed = false;
  for (const streamMessage of streamMessages) {
    const deltas = allDeltas.filter(
      (d) => d.streamId === streamMessage.streamId,
    );
    const existing = existingStreams.find(
      (s) => s.streamId === streamMessage.streamId,
    );
    const [newStream, messageChanged] = applyDeltasToStreamMessage(
      threadId,
      streamMessage,
      existing,
      deltas,
    );
    newStreams.push(newStream);
    if (messageChanged) changed = true;
  }
  for (const { streamId } of existingStreams) {
    if (!newStreams.find((s) => s.streamId === streamId)) {
      // There's a stream that's no longer active.
      changed = true;
    }
  }
  const messages = newStreams
    .map((s) => s.messages)
    .flat()
    .sort((a, b) => a.order - b.order || a.stepOrder - b.stepOrder);
  return [messages, newStreams, changed];
}

// exported for testing
export function applyDeltasToStreamMessage(
  threadId: string,
  streamMessage: StreamMessage,
  existing:
    | { streamId: string; cursor: number; messages: MessageDoc[] }
    | undefined,
  deltas: StreamDelta[],
): [{ streamId: string; cursor: number; messages: MessageDoc[] }, boolean] {
  let changed = false;
  let cursor = existing?.cursor ?? 0;
  let parts: TextStreamPart<ToolSet>[] = [];
  for (const delta of deltas.sort((a, b) => a.start - b.start)) {
    if (delta.parts.length === 0) {
      console.warn(`Got delta with no parts: ${JSON.stringify(delta)}`);
      continue;
    }
    if (cursor !== delta.start) {
      if (cursor >= delta.end) {
        console.debug(
          `Got duplicate delta for stream ${delta.streamId} at ${delta.start}`,
        );
        continue;
      } else if (cursor < delta.start) {
        console.warn(
          `Got delta for stream ${delta.streamId} that has a gap ${cursor} -> ${delta.start}`,
        );
        continue;
      } else {
        throw new Error(
          `Got unexpected delta for stream ${delta.streamId}: delta: ${delta.start} -> ${delta.end} existing cursor: ${cursor}`,
        );
      }
    }
    changed = true;
    cursor = delta.end;
    parts.push(...delta.parts);
  }
  if (existing && existing.messages.length > 0 && !changed) {
    const lastMessage = existing.messages.at(-1)!;
    if (statusFromStreamStatus(streamMessage.status) !== lastMessage.status) {
      changed = true;
    }
  }
  if (!changed) {
    return [
      existing ?? { streamId: streamMessage.streamId, cursor, messages: [] },
      false,
    ];
  }

  const existingMessages = existing?.messages ?? [];

  let currentMessage: MessageDoc;
  if (existingMessages.length > 0) {
    // replace the last message with a new one
    const lastMessage = existingMessages.at(-1)!;
    currentMessage = {
      ...lastMessage,
      message: cloneMessageAndContent(lastMessage.message),
      status: statusFromStreamStatus(streamMessage.status),
    };
  } else {
    const newMessage = createStreamingMessage(
      threadId,
      streamMessage,
      parts[0]!,
      existingMessages.length,
    );
    parts = parts.slice(1);
    currentMessage = newMessage;
  }
  const newStream = {
    streamId: streamMessage.streamId,
    cursor,
    messages: [...existingMessages.slice(0, -1), currentMessage],
  };
  let lastContent = getLastContent(currentMessage);
  for (const part of parts) {
    let contentToAdd:
      | Infer<typeof vTextPart>
      | Infer<typeof vToolCallPart>
      | Infer<typeof vToolResultPart>
      | Infer<typeof vReasoningPart>
      | undefined;
    const isToolRole = part.type === "source" || part.type === "tool-result";
    if (isToolRole !== (currentMessage.message!.role === "tool")) {
      currentMessage = createStreamingMessage(
        threadId,
        streamMessage,
        part,
        newStream.messages.length,
      );
      lastContent = getLastContent(currentMessage);
      newStream.messages.push(currentMessage);
      continue;
    }
    switch (part.type) {
      case "text-delta": {
        const text = part.text;
        currentMessage.text = (currentMessage.text ?? "") + text;
        if (lastContent?.type === "text") {
          lastContent.text = (lastContent.text ?? "") + text;
        } else {
          contentToAdd = { type: "text", text } satisfies Infer<
            typeof vTextPart
          >;
        }
        break;
      }
      case "tool-input-start": {
        const toolCallId = part.id;
        currentMessage.tool = true;
        contentToAdd = {
          type: "tool-call",
          toolCallId,
          toolName: part.toolName,
          args: "",
          providerExecuted:
            "providerExecuted" in part ? part.providerExecuted : undefined,
          providerOptions:
            "providerMetadata" in part ? part.providerMetadata : undefined,
        } satisfies Infer<typeof vToolCallPart>;
        break;
      }
      case "tool-input-delta":
        {
          currentMessage.tool = true;
          if (lastContent?.type !== "tool-call") {
            throw new Error("Expected last content to be a tool call");
          }
          if (typeof lastContent.args !== "string") {
            throw new Error("Expected args to be a string");
          }
          const delta =
            "argsTextDelta" in part ? part.argsTextDelta : part.delta;
          lastContent.args = (lastContent.args ?? "") + delta;
        }
        break;
      case "tool-call": {
        currentMessage.tool = true;
        contentToAdd = toolCallContent(part);
        break;
      }
      case "tool-result": {
        contentToAdd = toolResultContent(part);
        break;
      }
      case "reasoning-delta": {
        currentMessage.reasoning = (currentMessage.reasoning ?? "") + part.text;
        if (lastContent?.type === "reasoning") {
          lastContent.text = (lastContent.text ?? "") + part.text;
        } else {
          contentToAdd = {
            type: "reasoning",
            text: part.text,
            providerOptions:
              "providerMetadata" in part ? part.providerMetadata : undefined,
            state: "streaming",
          } satisfies Infer<typeof vReasoningPart>;
        }
        break;
      }
      case "source":
        if (!currentMessage.sources) {
          currentMessage.sources = [];
        }
        currentMessage.sources.push(part);
        break;
      case "raw":
        // ignore
        break;
      default:
        console.warn(`Received unexpected part: ${JSON.stringify(part)}`);
        break;
    }
    if (contentToAdd) {
      if (!currentMessage.message!.content) {
        currentMessage.message!.content = [];
      }
      if (!Array.isArray(currentMessage.message?.content)) {
        throw new Error("Expected message content to be an array");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      currentMessage.message.content.push(contentToAdd as any);
      lastContent = contentToAdd;
    }
  }
  return [newStream, true];
}

function toolCallContent(
  part: Extract<TextStreamPart<ToolSet>, { type: "tool-call" }>,
): Infer<typeof vToolCallPart> {
  const args = "args" in part ? part.args : part.input;
  return {
    type: "tool-call",
    toolCallId: part.toolCallId,
    toolName: part.toolName,
    args,
    providerExecuted: part.providerExecuted,
  } satisfies Infer<typeof vToolCallPart>;
}

function toolResultContent(
  part: Extract<TextStreamPart<ToolSet>, { type: "tool-result" }>,
): Infer<typeof vToolResultPart> {
  return {
    type: "tool-result",
    toolCallId: part.toolCallId,
    toolName: part.toolName,
    result: part.output,
    args: part.input,
    providerExecuted: part.providerExecuted,
  } satisfies Infer<typeof vToolResultPart>;
}
function cloneMessageAndContent(
  message: Message | undefined,
): Message | undefined {
  return (
    message &&
    ({
      ...message,
      content: Array.isArray(message.content)
        ? [...message.content]
        : message.content,
    } as typeof message)
  );
}

function getLastContent(message: MessageDoc) {
  if (Array.isArray(message.message?.content)) {
    return message.message.content.at(-1);
  }
  return undefined;
}

function statusFromStreamStatus(
  status: StreamMessage["status"],
): MessageStatus {
  switch (status) {
    case "streaming":
      return "pending";
    case "finished":
      return "success";
    case "aborted":
      return "failed";
    default:
      return "pending";
  }
}

// TODO: share more code with applyDeltasToStreamMessage
export function createStreamingMessage(
  threadId: string,
  message: StreamMessage,
  part: TextStreamPart<ToolSet>,
  index: number,
): MessageDoc {
  const { streamId, ...rest } = message;
  const metadata: MessageDoc = {
    ...rest,
    _id: `${streamId}-${index}`,
    _creationTime: Date.now(),
    status: statusFromStreamStatus(message.status),
    threadId,
    tool: false,
  };
  switch (part.type) {
    case "text-delta": {
      const text = part.text || "";
      return {
        ...metadata,
        message: { role: "assistant", content: [{ type: "text", text }] },
        text,
      };
    }
    case "tool-input-start": {
      return {
        ...metadata,
        tool: true,
        message: {
          role: "assistant",
          content: [
            {
              type: "tool-call",
              toolName: part.toolName,
              toolCallId: part.id,
              args: "", // when it's a string, it's a partial call
              providerExecuted:
                "providerExecuted" in part ? part.providerExecuted : undefined,
              providerOptions:
                "providerMetadata" in part ? part.providerMetadata : undefined,
            },
          ],
        },
      };
    }
    case "tool-input-delta": {
      console.warn("Received tool call delta part first??");
      const delta = part.delta;
      const toolCallId = part.id;
      const toolName = part.type.slice("tool-".length);
      return {
        ...metadata,
        tool: true,
        message: {
          role: "assistant",
          content: [{ type: "tool-call", toolCallId, toolName, args: delta }],
        },
      };
    }
    case "tool-call": {
      return {
        ...metadata,
        tool: true,
        message: { role: "assistant", content: [toolCallContent(part)] },
      };
    }
    case "tool-result":
      return {
        ...metadata,
        tool: true,
        message: { role: "tool", content: [toolResultContent(part)] },
      };
    case "reasoning-delta": {
      return {
        ...metadata,
        message: {
          role: "assistant",
          content: [{ type: "reasoning", text: part.text }],
        },
        reasoning: part.text,
      };
    }
    case "source":
      console.warn("Received source part first??");
      return {
        ...metadata,
        tool: true,
        message: { role: "tool", content: [] },
        sources: [part],
      };
    // case "raw":
    //   return {
    //     ...metadata,
    //     message: { role: "assistant", content: [part.rawValue] },
    //   };
    default:
      throw new Error(`Unexpected part type: ${JSON.stringify(part)}`);
  }
}
