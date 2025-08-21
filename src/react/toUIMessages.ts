import type {
  UIMessage as AIUIMessage,
  DeepPartial,
  ReasoningUIPart,
  SourceDocumentUIPart,
  SourceUrlUIPart,
  StepStartUIPart,
  TextUIPart,
  ToolUIPart,
  UIDataTypes,
  UITools,
} from "ai";
import { extractText, type MessageDoc } from "../client/index.js";
import { deserializeMessage, toUIFilePart } from "../mapping.js";
import type { MessageStatus } from "../validators.js";
import { sorted } from "../shared.js";

export type UIMessage<
  METADATA = unknown,
  DATA_PARTS extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
> = AIUIMessage<METADATA, DATA_PARTS, TOOLS> & {
  key: string;
  order: number;
  stepOrder: number;
  status: "streaming" | MessageStatus;
  agentName?: string;
  text: string;
  _creationTime: number;
};

export function toUIMessages<
  METADATA = unknown,
  DATA_PARTS extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
>(
  messages: (MessageDoc & { streaming?: boolean })[],
): UIMessage<METADATA, DATA_PARTS, TOOLS>[] {
  // Group assistant and tool messages together
  const assistantGroups = groupAssistantMessages(messages);

  const uiMessages: UIMessage<METADATA, DATA_PARTS, TOOLS>[] = [];
  for (const group of assistantGroups) {
    if (group.role === "system") {
      uiMessages.push(createSystemUIMessage(group.message));
    } else if (group.role === "user") {
      uiMessages.push(createUserUIMessage(group.message));
    } else {
      // Assistant/tool group
      uiMessages.push(createAssistantUIMessage(group.messages));
    }
  }

  return uiMessages;
}

type Group =
  | {
      role: "user";
      message: MessageDoc & { streaming?: boolean };
    }
  | {
      role: "system";
      message: MessageDoc & { streaming?: boolean };
    }
  | {
      role: "assistant";
      messages: (MessageDoc & { streaming?: boolean })[];
    };

function groupAssistantMessages(
  messages: (MessageDoc & { streaming?: boolean })[],
): Group[] {
  const groups: Group[] = [];

  // Sort messages by order and stepOrder first to handle out-of-order arrivals
  const sortedMessages = sorted(messages);

  let currentAssistantGroup: (MessageDoc & { streaming?: boolean })[] = [];
  let currentOrder: number | undefined;

  for (const message of sortedMessages) {
    const coreMessage = message.message && deserializeMessage(message.message);
    if (!coreMessage) continue;

    if (coreMessage.role === "user" || coreMessage.role === "system") {
      // Finish any current assistant group
      if (currentAssistantGroup.length > 0) {
        groups.push({
          role: "assistant",
          messages: currentAssistantGroup,
        });
        currentAssistantGroup = [];
        currentOrder = undefined;
      }
      // Add singleton group
      groups.push({
        role: coreMessage.role,
        message,
      });
    } else {
      // Assistant or tool message

      // Start new group if order changes or this is the first assistant/tool message
      if (currentOrder !== undefined && message.order !== currentOrder) {
        if (currentAssistantGroup.length > 0) {
          groups.push({
            role: "assistant",
            messages: currentAssistantGroup,
          });
          currentAssistantGroup = [];
        }
      }

      currentOrder = message.order;
      currentAssistantGroup.push(message);

      // End group if this is an assistant message without tool calls
      // But only if we're processing messages in order (which we are now due to sorting)
      if (coreMessage.role === "assistant" && !message.tool) {
        groups.push({
          role: "assistant",
          messages: currentAssistantGroup,
        });
        currentAssistantGroup = [];
        currentOrder = undefined;
      }
    }
  }

  // Add any remaining assistant group
  if (currentAssistantGroup.length > 0) {
    groups.push({
      role: "assistant",
      messages: currentAssistantGroup,
    });
  }

  return groups;
}

function createSystemUIMessage<
  METADATA = unknown,
  DATA_PARTS extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
>(
  message: MessageDoc & { streaming?: boolean },
): UIMessage<METADATA, DATA_PARTS, TOOLS> {
  const text = extractTextFromMessageDoc(message);
  const partCommon = {
    state: message.streaming ? ("streaming" as const) : ("done" as const),
    ...(message.providerMetadata
      ? { providerMetadata: message.providerMetadata }
      : {}),
  };

  return {
    id: message._id,
    _creationTime: message._creationTime,
    order: message.order,
    stepOrder: message.stepOrder,
    status: message.streaming ? ("streaming" as const) : message.status,
    key: `${message.threadId}-${message.order}-${message.stepOrder}`,
    text,
    role: "system",
    agentName: message.agentName,
    parts: [{ type: "text", text, ...partCommon } satisfies TextUIPart],
  };
}

function extractTextFromMessageDoc(message: MessageDoc): string {
  return (
    message.text || (message.message && extractText(message.message)) || ""
  );
}

function createUserUIMessage<
  METADATA = unknown,
  DATA_PARTS extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
>(
  message: MessageDoc & { streaming?: boolean },
): UIMessage<METADATA, DATA_PARTS, TOOLS> {
  const text = extractTextFromMessageDoc(message);
  const coreMessage = deserializeMessage(message.message!);
  const content = coreMessage.content;
  const nonStringContent =
    content && typeof content !== "string" ? content : [];

  const partCommon = {
    state: message.streaming ? ("streaming" as const) : ("done" as const),
    ...(message.providerMetadata
      ? { providerMetadata: message.providerMetadata }
      : {}),
  };

  const parts: UIMessage<METADATA, DATA_PARTS, TOOLS>["parts"] = [];
  if (text && !nonStringContent.length) {
    parts.push({ type: "text", text });
  }
  for (const contentPart of nonStringContent) {
    switch (contentPart.type) {
      case "text":
        parts.push({ type: "text", text: contentPart.text, ...partCommon });
        break;
      case "file":
      case "image":
        parts.push(toUIFilePart(contentPart));
        break;
      default:
        console.warn("Unknown content part type for user", contentPart);
        break;
    }
  }

  return {
    id: message._id,
    _creationTime: message._creationTime,
    order: message.order,
    stepOrder: message.stepOrder,
    status: message.streaming ? ("streaming" as const) : message.status,
    key: `${message.threadId}-${message.order}-${message.stepOrder}`,
    text,
    role: "user",
    parts,
  };
}

function createAssistantUIMessage<
  METADATA = unknown,
  DATA_PARTS extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
>(
  groupUnordered: (MessageDoc & { streaming?: boolean })[],
): UIMessage<METADATA, DATA_PARTS, TOOLS> {
  const group = sorted(groupUnordered);
  const firstMessage = group[0];

  // Use first message for special fields
  const common = {
    id: firstMessage._id,
    _creationTime: firstMessage._creationTime,
    order: firstMessage.order,
    stepOrder: firstMessage.stepOrder,
    key: `${firstMessage.threadId}-${firstMessage.order}-${firstMessage.stepOrder}`,
    agentName: firstMessage.agentName,
  };

  // Concatenate text from all messages in group
  const allText = group
    .map((msg) => msg.text || ((msg.message && extractText(msg.message)) ?? ""))
    .filter(Boolean)
    .join("");

  // Get status from last message
  const lastMessage = group[group.length - 1];
  const status = lastMessage.streaming
    ? ("streaming" as const)
    : lastMessage.status;

  // Collect all parts from all messages
  const allParts: UIMessage<METADATA, DATA_PARTS, TOOLS>["parts"] = [];

  for (const message of group) {
    const coreMessage = message.message && deserializeMessage(message.message);
    if (!coreMessage) continue;

    const content = coreMessage.content;
    const nonStringContent =
      content && typeof content !== "string" ? content : [];
    const text =
      message.text || ((message.message && extractText(message.message)) ?? "");

    const partCommon = {
      state: message.streaming ? ("streaming" as const) : ("done" as const),
      ...(message.providerMetadata
        ? { providerMetadata: message.providerMetadata }
        : {}),
    };

    // Add reasoning parts
    if (
      message.reasoning &&
      !nonStringContent.some((c) => c.type === "reasoning")
    ) {
      allParts.push({
        type: "reasoning",
        text: message.reasoning,
        ...partCommon,
      } satisfies ReasoningUIPart);
    }

    // Add text parts if no structured content
    if (text && !nonStringContent.length) {
      allParts.push({
        type: "text",
        text: text,
        ...partCommon,
      } satisfies TextUIPart);
    }

    // Add all structured content parts
    for (const contentPart of nonStringContent) {
      switch (contentPart.type) {
        case "text":
          allParts.push({
            ...partCommon,
            ...contentPart,
          } satisfies TextUIPart);
          break;
        case "reasoning":
          allParts.push({
            ...partCommon,
            ...contentPart,
          } satisfies ReasoningUIPart);
          break;
        case "file":
        case "image":
          allParts.push(toUIFilePart(contentPart));
          break;
        case "tool-call": {
          allParts.push({
            type: "step-start",
          } satisfies StepStartUIPart);
          const toolPart: ToolUIPart<TOOLS> = {
            type: `tool-${contentPart.toolName as keyof TOOLS & string}`,
            toolCallId: contentPart.toolCallId,
            input: contentPart.input as DeepPartial<
              TOOLS[keyof TOOLS & string]["input"]
            >,
            providerExecuted: contentPart.providerExecuted,
            ...(message.streaming
              ? { state: "input-streaming" }
              : {
                  state: "input-available",
                  callProviderMetadata: message.providerMetadata,
                }),
          };
          allParts.push(toolPart);
          break;
        }
        case "tool-result": {
          const call = allParts.find(
            (part) =>
              part.type === `tool-${contentPart.toolName}` &&
              "toolCallId" in part &&
              part.toolCallId === contentPart.toolCallId,
          ) as ToolUIPart | undefined;
          if (call) {
            if (message.error) {
              call.state = "output-error";
              call.errorText = message.error;
              call.output = contentPart.output;
            } else {
              call.state = "output-available";
              call.output =
                contentPart.output?.type === "json"
                  ? contentPart.output.value
                  : contentPart.output;
            }
          } else {
            console.warn(
              "Tool result without preceding tool call.. adding anyways",
              contentPart,
            );
            if (message.error) {
              allParts.push({
                type: `tool-${contentPart.toolName}`,
                toolCallId: contentPart.toolCallId,
                state: "output-error",
                input: undefined,
                errorText: message.error,
                callProviderMetadata: message.providerMetadata,
              } satisfies ToolUIPart<TOOLS>);
            } else {
              allParts.push({
                type: `tool-${contentPart.toolName}`,
                toolCallId: contentPart.toolCallId,
                state: "output-available",
                input: undefined,
                output:
                  contentPart.output?.type === "json"
                    ? contentPart.output.value
                    : contentPart.output,
                callProviderMetadata: message.providerMetadata,
              } satisfies ToolUIPart<TOOLS>);
            }
          }
          break;
        }
      }
    }

    // Add source parts
    for (const source of message.sources ?? []) {
      if (source.sourceType === "url") {
        allParts.push({
          type: "source-url",
          url: source.url!,
          sourceId: source.id,
          providerMetadata: message.providerMetadata,
          title: source.title,
        } satisfies SourceUrlUIPart);
      } else {
        allParts.push({
          type: "source-document",
          mediaType: source.mediaType,
          sourceId: source.id,
          title: source.title,
          filename: source.filename,
          providerMetadata: message.providerMetadata,
        } satisfies SourceDocumentUIPart);
      }
    }
  }

  return {
    ...common,
    role: "assistant",
    text: allText,
    status,
    parts: allParts,
  };
}
