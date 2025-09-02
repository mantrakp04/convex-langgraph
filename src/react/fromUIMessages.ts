import { convertToModelMessages } from "ai";
import { extractReasoning, extractText, isTool } from "../shared.js";
import type { MessageDoc, vSource } from "../validators.js";
import type { UIMessage } from "./toUIMessages.js";
import type { ProviderOptions } from "@ai-sdk/provider-utils";
import { omit } from "convex-helpers";
import { fromModelMessage } from "../mapping.js";
import type { Infer } from "convex/values";

export function fromUIMessages<METADATA = unknown>(
  threadId: string,
  messages: (UIMessage<METADATA> & {
    userId?: string;
    model?: string;
    provider?: string;
    providerOptions?: ProviderOptions;
  })[],
): (MessageDoc & { streaming: boolean; metadata?: METADATA })[] {
  return messages.flatMap((uiMessage) => {
    const stepOrder = uiMessage.stepOrder;
    const commonFields = {
      _id: uiMessage.id,
      ...omit(uiMessage, ["parts", "role", "key", "text"]),
      threadId,
      status: uiMessage.status === "streaming" ? "pending" : "success",
      streaming: uiMessage.status === "streaming",
      // to override
      tool: false,
    } satisfies MessageDoc & { streaming: boolean; metadata?: METADATA };
    const modelMessages = convertToModelMessages([uiMessage]);
    return modelMessages
      .map((modelMessage, i) => {
        if (modelMessage.content.length === 0) {
          return undefined;
        }
        const message = fromModelMessage(modelMessage);
        const tool = isTool(message);
        const doc: MessageDoc & { streaming: boolean; metadata?: METADATA } = {
          ...commonFields,
          stepOrder: stepOrder + i,
          message,
          tool,
          text: extractText(message),
          reasoning: extractReasoning(message),
          finishReason: tool ? "tool-calls" : "stop",
          sources: fromSourceParts(uiMessage.parts),
        };
        if (Array.isArray(modelMessage.content)) {
          const providerOptions = modelMessage.content.find(
            (c) => c.providerOptions,
          )?.providerOptions;
          if (providerOptions) {
            // convertToModelMessages changes providerMetadata to providerOptions
            doc.providerMetadata = providerOptions;
            doc.providerOptions ??= providerOptions;
          }
        }
        return doc;
      })
      .filter((d) => d !== undefined);
  });
}

function fromSourceParts(parts: UIMessage["parts"]): Infer<typeof vSource>[] {
  return parts
    .map((part) => {
      if (part.type === "source-url") {
        return {
          type: "source",
          sourceType: "url",
          url: part.url,
          id: part.sourceId,
          providerMetadata: part.providerMetadata,
          title: part.title,
        } satisfies Infer<typeof vSource>;
      }
      if (part.type === "source-document") {
        return {
          type: "source",
          sourceType: "document",
          mediaType: part.mediaType,
          id: part.sourceId,
          providerMetadata: part.providerMetadata,
          title: part.title,
        } satisfies Infer<typeof vSource>;
      }
      return undefined;
    })
    .filter((p) => p !== undefined);
}
