"use client";
import { useMemo, useState, useEffect } from "react";
import { type UIDataTypes, type UIMessageChunk, type UITools } from "ai";
import type { StreamQuery, StreamQueryArgs } from "./types.js";
import { type UIMessage } from "../UIMessages.js";
import {
  blankUIMessage,
  getParts,
  statusFromStreamStatus,
  updateFromUIMessageChunks,
  updateFromTextStreamParts,
} from "../deltas.js";
import { useDeltaStreams } from "./useDeltaStreams.js";

// Polyfill structuredClone to support readUIMessageStream on ReactNative
if (!("structuredClone" in globalThis)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  void import("@ungap/structured-clone" as any).then(
    ({ default: structuredClone }) =>
      (globalThis.structuredClone = structuredClone),
  );
}

/**
 * A hook that fetches streaming messages from a thread and converts them to UIMessages
 * using AI SDK's readUIMessageStream.
 * This ONLY returns streaming UIMessages. To get both full and streaming messages,
 * use `useUIMessages`.
 *
 * @param query The query to use to fetch messages.
 * It must take as arguments `{ threadId, paginationOpts, streamArgs }` and
 * return a `streams` object returned from `agent.syncStreams`.
 * @param args The arguments to pass to the query other than `paginationOpts`
 * and `streamArgs`. So `{ threadId }` at minimum, plus any other arguments that
 * you want to pass to the query.
 * @returns The streaming UIMessages.
 */
export function useStreamingUIMessages<
  METADATA = unknown,
  DATA_PARTS extends UIDataTypes = UIDataTypes,
  TOOLS extends UITools = UITools,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query extends StreamQuery<any> = StreamQuery<object>,
>(
  query: Query,
  args: StreamQueryArgs<Query> | "skip",
  options?: {
    startOrder?: number;
    skipStreamIds?: string[];
  },
  // TODO: make generic on metadata, etc.
): UIMessage<METADATA, DATA_PARTS, TOOLS>[] | undefined {
  const [messageState, setMessageState] = useState<
    Record<
      string,
      {
        uiMessage: UIMessage<METADATA, DATA_PARTS, TOOLS>;
        cursor: number;
      }
    >
  >({});

  const streams = useDeltaStreams(query, args, options);

  const threadId = args === "skip" ? undefined : args.threadId;

  useEffect(() => {
    if (!streams) return;
    const abortController = new AbortController();
    void (async () => {
      let changed = false;
      const newMessageState: Record<
        string,
        {
          uiMessage: UIMessage<METADATA, DATA_PARTS, TOOLS>;
          cursor: number;
        }
      > = {};
      for (const stream of streams) {
        if (abortController.signal.aborted) return;
        const oldState = messageState[stream.streamMessage.streamId];
        let uiMessage = oldState?.uiMessage;
        if (!oldState) {
          changed = true;
          uiMessage = blankUIMessage(
            stream.streamMessage,
            threadId,
          ) as UIMessage<METADATA, DATA_PARTS, TOOLS>;
        }
        const { parts, cursor } = getParts<UIMessageChunk>(
          stream.deltas,
          oldState?.cursor,
        );
        if (parts.length) {
          changed = true;
          if (stream.streamMessage.format === "UIMessageChunk") {
            uiMessage = (await updateFromUIMessageChunks(
              uiMessage,
              parts,
            )) as UIMessage<METADATA, DATA_PARTS, TOOLS>;
            if (
              uiMessage.status !== "failed" &&
              uiMessage.status !== "success"
            ) {
              uiMessage.status = statusFromStreamStatus(
                stream.streamMessage.status,
              );
            }
          } else if (
            stream.streamMessage.format === "TextStreamPart" ||
            !stream.streamMessage.format
          ) {
            const updated = updateFromTextStreamParts(
              threadId,
              stream.streamMessage,
              {
                streamId: stream.streamMessage.streamId,
                cursor,
                message: uiMessage,
              },
              stream.deltas,
            )[0];
            uiMessage = updated.message as UIMessage<
              METADATA,
              DATA_PARTS,
              TOOLS
            >;
          } else {
            console.error("Unknown format", stream.streamMessage.format);
          }
        }
        newMessageState[stream.streamMessage.streamId] = {
          uiMessage,
          cursor,
        };
      }
      if (!changed || abortController.signal.aborted) return;
      setMessageState(newMessageState);
    })();
    return () => {
      abortController.abort();
    };
  }, [messageState, streams, threadId]);

  return useMemo(() => {
    if (!streams) return undefined;
    return streams
      .map(
        ({ streamMessage }) => messageState[streamMessage.streamId]?.uiMessage,
      )
      .filter((uiMessage) => uiMessage !== undefined);
  }, [messageState, streams]);
}
