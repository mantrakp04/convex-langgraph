"use client";
import { omit } from "convex-helpers";
import { useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { useMemo, useState, useEffect, useRef } from "react";
import { readUIMessageStream, type UIMessageChunk } from "ai";
import type { SyncStreamsReturnValue } from "../client/types.js";
import type { StreamArgs } from "../validators.js";
import type { ThreadStreamQuery, ThreadMessagesArgs } from "./types.js";
import { toUIMessages, type UIMessage } from "./toUIMessages.js";
import { blankUIMessage, getParts, mergeTextChunkDeltas } from "../deltas.js";
import { sorted } from "../shared.js";
import { fromUIMessages } from "./fromUIMessages.js";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query extends ThreadStreamQuery<any, any>,
>(
  query: Query,
  args:
    | (ThreadMessagesArgs<Query> & {
        startOrder?: number;
        skipStreamIds?: string[];
      })
    | "skip",
  // TODO: make generic on metadata, etc.
): UIMessage[] | undefined {
  const [uiMessages, setUIMessages] = useState<Record<string, UIMessage>>({});
  const [streamCursors, setStreamCursors] = useState<Record<string, number>>(
    {},
  );
  const uiMessageStreamControllers = useRef<
    Map<string, ReadableStreamDefaultController<UIMessageChunk>>
  >(new Map());

  const queryArgs =
    args === "skip" ? args : omit(args, ["startOrder", "skipStreamIds"]);

  // Get all the active streams
  const streamList = useQuery(
    query,
    queryArgs === "skip"
      ? queryArgs
      : ({
          ...queryArgs,
          paginationOpts: { cursor: null, numItems: 0 },
          streamArgs: {
            kind: "list",
            startOrder: queryArgs.startOrder ?? 0,
          } as StreamArgs,
        } as FunctionArgs<Query>),
  ) as
    | { streams: Extract<SyncStreamsReturnValue, { kind: "list" }> }
    | undefined;

  const skipStreamIds = args === "skip" ? undefined : args.skipStreamIds;
  // Get the cursors for all the active streams
  const cursors = useMemo(() => {
    if (!streamList?.streams) return [];
    if (streamList.streams.kind !== "list") {
      throw new Error("Expected list streams");
    }
    return streamList.streams.messages
      .filter(({ streamId }) => !skipStreamIds?.includes(streamId))
      .map(({ streamId }) => {
        const cursor = streamCursors[streamId] ?? 0;
        return { streamId, cursor };
      });
  }, [streamList, streamCursors, skipStreamIds]);

  // Get the deltas for all the active streams, if any.
  const cursorQuery = useQuery(
    query,
    queryArgs === "skip" || !streamList
      ? ("skip" as const)
      : ({
          ...queryArgs,
          paginationOpts: { cursor: null, numItems: 0 },
          streamArgs: { kind: "deltas", cursors } as StreamArgs,
        } as FunctionArgs<Query>),
  ) as
    | { streams: Extract<SyncStreamsReturnValue, { kind: "deltas" }> }
    | undefined;

  const threadId = args === "skip" ? undefined : args.threadId;

  // Process new deltas and convert to UIMessageChunks, then use readUIMessageStream
  useEffect(() => {
    if (!cursorQuery?.streams?.deltas || !threadId) return;

    const deltasByStream = new Map<string, typeof cursorQuery.streams.deltas>();

    // Group deltas by streamId
    for (const delta of cursorQuery.streams.deltas) {
      if (!deltasByStream.has(delta.streamId)) {
        deltasByStream.set(delta.streamId, []);
      }
      deltasByStream.get(delta.streamId)!.push(delta);
    }

    // Process each stream's deltas
    for (const [streamId, deltas] of deltasByStream.entries()) {
      const streamMessage = streamList?.streams?.messages.find(
        (m) => m.streamId === streamId,
      );
      if (!streamMessage) continue;
      if (streamMessage.format === "UIMessageChunk") {
        setStreamCursors((streamCursors) => {
          const currentCursor = streamCursors[streamId] ?? 0;

          const { parts, cursor } = getParts<UIMessageChunk>(
            deltas,
            currentCursor,
          );

          const newStreamCursors =
            cursor === currentCursor
              ? streamCursors
              : { ...streamCursors, [streamId]: cursor };

          if (parts.length === 0) return newStreamCursors;

          // Get existing message for this stream as starting point
          const existingStream =
            uiMessageStreamControllers.current.get(streamId);
          if (existingStream) {
            for (const part of parts) {
              existingStream.enqueue(part);
            }
          } else {
            const stream = new ReadableStream<UIMessageChunk>({
              start(controller) {
                uiMessageStreamControllers.current.set(streamId, controller);
                for (const part of parts) {
                  controller.enqueue(part);
                }
              },
            });
            const initialMessage = blankUIMessage(streamMessage, threadId);
            setUIMessages((prev) => ({
              ...prev,
              [streamId]: initialMessage,
            }));

            const messageStream = readUIMessageStream({
              message: initialMessage,
              stream,
              onError: (error) => {
                setUIMessages((prev) => ({
                  ...prev,
                  [streamId]: {
                    ...prev[streamId],
                    status: "failed",
                  },
                }));
                console.error(`Error in stream ${streamId}:`, error);
              },
              terminateOnError: false,
            });

            // Process the async iterator
            void (async () => {
              for await (const message of messageStream) {
                // If we don't have a ui message assume we've aborted.
                setUIMessages((prev) =>
                  prev[streamId]
                    ? {
                        ...prev,
                        [streamId]: message,
                      }
                    : prev,
                );
              }
            })().catch((error) => {
              console.error(`Error processing stream ${streamId}:`, error);
            });
          }
          return newStreamCursors;
        });
      } else {
        setUIMessages((uiMessages) => {
          const existingUIMessage = uiMessages[streamId];
          const [messageDocs, [streamMetadata], changed] = mergeTextChunkDeltas(
            threadId,
            [streamMessage],
            existingUIMessage
              ? [
                  {
                    streamId,
                    cursor: streamCursors[streamId] ?? 0,
                    messages: fromUIMessages(threadId, [existingUIMessage]),
                  },
                ]
              : [],
            deltas,
          );
          if (changed) {
            setStreamCursors((prev) => ({
              ...prev,
              [streamId]: streamMetadata.cursor,
            }));
            return {
              ...uiMessages,
              [streamId]: toUIMessages(messageDocs)[0],
            };
          }
          return uiMessages;
        });
      }
    }
  }, [cursorQuery, streamCursors, threadId, streamList?.streams?.messages]);

  // Clean up finished streams
  useEffect(() => {
    const activeStreamIds = new Set(
      streamList?.streams.messages.map((m) => m.streamId) ?? [],
    );
    setUIMessages((prev) => {
      const toRemove = Object.keys(prev).filter(
        (streamId) => !activeStreamIds.has(streamId),
      );
      return toRemove.length ? omit(prev, toRemove) : prev;
    });
    for (const [
      streamId,
      controller,
    ] of uiMessageStreamControllers.current.entries()) {
      if (!activeStreamIds.has(streamId)) {
        controller.close();
        uiMessageStreamControllers.current.delete(streamId);
      }
    }
  }, [streamList]);

  const loading = !streamList;
  return useMemo(() => {
    if (loading) return undefined;
    return sorted(Array.from(Object.values(uiMessages)));
  }, [uiMessages, loading]);
}
