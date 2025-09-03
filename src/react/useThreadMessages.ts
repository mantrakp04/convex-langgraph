"use client";
import { omit, type ErrorMessage } from "convex-helpers";
import {
  type PaginatedQueryArgs,
  type UsePaginatedQueryResult,
  type UsePaginatedQueryReturnType,
  useQuery,
} from "convex/react";
import { usePaginatedQuery } from "convex-helpers/react";
import type { FunctionArgs, PaginationResult } from "convex/server";
import { useEffect, useMemo, useRef, useState } from "react";
import { sorted } from "../shared.js";
import type { MessageDoc } from "../validators.js";
import type { SyncStreamsReturnValue } from "../client/types.js";
import type { StreamArgs } from "../validators.js";
import {
  blankUIMessage,
  deriveUIMessagesFromTextStreamParts,
  getParts,
} from "../deltas.js";
import type {
  ThreadQuery,
  ThreadStreamQuery,
  ThreadMessagesArgs,
  ThreadMessagesResult,
  MessageLike,
} from "./types.js";
import { readUIMessageStream, type UIMessageChunk } from "ai";
import { fromUIMessages } from "./fromUIMessages.js";
import { toUIMessages } from "./toUIMessages.js";

/**
 * A hook that fetches messages from a thread.
 *
 * This hook is a wrapper around `usePaginatedQuery` and `useStreamingThreadMessages`.
 * It will fetch both full messages and streaming messages, and merge them together.
 *
 * The query must take as arguments `{ threadId, paginationOpts }` and return a
 * pagination result of objects that extend `MessageDoc`.
 *
 * For streaming, it should look like this:
 * ```ts
 * export const listThreadMessages = query({
 *   args: {
 *     threadId: v.string(),
 *     paginationOpts: paginationOptsValidator,
 *     streamArgs: vStreamArgs,
 *     ... other arguments you want
 *   },
 *   handler: async (ctx, { threadId, paginationOpts, streamArgs }) => {
 *     // await authorizeThreadAccess(ctx, threadId);
 *     const paginated = await agent.listMessages(ctx, { threadId, paginationOpts });
 *     const streams = await agent.syncStreams(ctx, { threadId, streamArgs });
 *     // Here you could filter out / modify the documents & stream deltas.
 *     return { ...paginated, streams };
 *   },
 * });
 * ```
 *
 * Then the hook can be used like this:
 * ```ts
 * const messages = useThreadMessages(
 *   api.myModule.listThreadMessages,
 *   { threadId },
 *   { initialNumItems: 10, stream: true }
 * );
 * ```
 *
 * @param query The query to use to fetch messages.
 * It must take as arguments `{ threadId, paginationOpts }` and return a
 * pagination result of objects that extend `MessageDoc`.
 * To support streaming, it must also take in `streamArgs: vStreamArgs` and
 * return a `streams` object returned from `agent.syncStreams`.
 * @param args The arguments to pass to the query other than `paginationOpts`
 * and `streamArgs`. So `{ threadId }` at minimum, plus any other arguments that
 * you want to pass to the query.
 * @param options The options for the query. Similar to usePaginatedQuery.
 * To enable streaming, pass `stream: true`.
 * @returns The messages. If stream is true, it will return a list of messages
 *   that includes both full messages and streaming messages.
 */
export function useThreadMessages<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query extends ThreadQuery<any, any>,
>(
  query: Query,
  args: ThreadMessagesArgs<Query> | "skip",
  options: {
    initialNumItems: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stream?: Query extends ThreadStreamQuery
      ? boolean
      : ErrorMessage<"To enable streaming, your query must take in streamArgs: vStreamArgs and return a streams object returned from agent.syncStreams. See docs.">;
  },
): UsePaginatedQueryResult<
  ThreadMessagesResult<Query> & { streaming?: boolean }
> {
  // These are full messages
  const paginated = usePaginatedQuery(
    query,
    args as PaginatedQueryArgs<Query> | "skip",
    { initialNumItems: options.initialNumItems },
  );

  let startOrder = paginated.results.at(-1)?.order ?? 0;
  for (let i = paginated.results.length - 1; i >= 0; i--) {
    const m = paginated.results[i];
    if (!m.streaming && m.status === "pending") {
      // round down to the nearest 10 for some cache benefits
      startOrder = m.order - (m.order % 10);
      break;
    }
  }
  // These are streaming messages that will not include full messages.
  const streamMessages = useStreamingThreadMessages(
    query as ThreadStreamQuery<
      ThreadMessagesArgs<Query>,
      ThreadMessagesResult<Query>
    >,
    !options.stream ||
      args === "skip" ||
      paginated.status === "LoadingFirstPage"
      ? "skip"
      : { ...args, startOrder },
  );

  const merged = useMemo(() => {
    const streamListMessages =
      streamMessages?.map((m) => ({
        ...m,
        streaming: !m.status || m.status === "pending",
      })) ?? [];
    return {
      ...paginated,
      results: sorted(
        paginated.results
          .map((m) => ({ ...m, streaming: false }))
          // Note: this is intentionally after paginated results.
          .concat(streamListMessages),
      ).reduce(
        (msgs, msg) => {
          const last = msgs.at(-1);
          if (!last) {
            return [msg];
          }
          if (last.order !== msg.order || last.stepOrder !== msg.stepOrder) {
            return [...msgs, msg];
          }
          if (
            last.status === "pending" &&
            (msg.streaming || msg.status !== "pending")
          ) {
            // Let's prefer a streaming or finalized message over a pending
            // one.
            return [...msgs.slice(0, -1), msg];
          }
          // skip the new one if the previous one (listed) was finalized
          return msgs;
        },
        [] as (ThreadMessagesResult<Query> & { streaming: boolean })[],
      ),
    };
  }, [paginated, streamMessages]);

  return merged as ThreadMessagesResult<Query>;
}

/**
 * A hook that fetches streaming messages from a thread.
 * This ONLY returns streaming messages. To get both, use `useThreadMessages`.
 *
 * @param query The query to use to fetch messages.
 * It must take as arguments `{ threadId, paginationOpts, streamArgs }` and
 * return a `streams` object returned from `agent.syncStreams`.
 * @param args The arguments to pass to the query other than `paginationOpts`
 * and `streamArgs`. So `{ threadId }` at minimum, plus any other arguments that
 * you want to pass to the query.
 * @returns The streaming messages.
 */
export function useStreamingThreadMessages<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query extends ThreadStreamQuery<any, any>,
>(
  query: Query,
  args:
    | (ThreadMessagesArgs<Query> & {
        /** @deprecated use the options parameter (third argument) instead */
        startOrder?: number;
      })
    | "skip",
  options?: {
    startOrder?: number;
    skipStreamIds?: string[];
  },
): Array<MessageDoc> | undefined {
  const [messages, setMessages] = useState<Record<string, MessageDoc[]>>({});
  const [streamCursors, setStreamCursors] = useState<Record<string, number>>(
    {},
  );
  const uiMessageStreamControllers = useRef<
    Map<string, ReadableStreamDefaultController<UIMessageChunk>>
  >(new Map());

  const startOrder =
    (options?.startOrder ?? args === "skip") ? 0 : (args.startOrder ?? 0);
  const queryArgs = args === "skip" ? args : omit(args, ["startOrder"]);

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
            startOrder,
          } as StreamArgs,
        } as FunctionArgs<Query>),
  ) as
    | { streams: Extract<SyncStreamsReturnValue, { kind: "list" }> }
    | undefined;

  // Get the cursors for all the active streams
  const cursors = useMemo(() => {
    if (!streamList?.streams) return [];
    if (streamList.streams.kind !== "list") {
      throw new Error("Expected list streams");
    }
    return streamList.streams.messages
      .filter(({ streamId }) => !options?.skipStreamIds?.includes(streamId))
      .map(({ streamId }) => {
        const cursor = streamCursors[streamId] ?? 0;
        return { streamId, cursor };
      });
  }, [streamList, streamCursors, options?.skipStreamIds]);

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

  const threadId = queryArgs === "skip" ? undefined : queryArgs.threadId;

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
            setMessages((prev) => ({
              ...prev,
              [streamId]: fromUIMessages([initialMessage], {
                threadId,
                ...streamMessage,
              }),
            }));

            const messageStream = readUIMessageStream({
              message: initialMessage,
              stream,
              onError: (error) => {
                setMessages((prev) => ({
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
                setMessages((prev) =>
                  prev[streamId]
                    ? {
                        ...prev,
                        [streamId]: fromUIMessages([message], {
                          threadId,
                          ...streamMessage,
                        }),
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
        setMessages((uiMessages) => {
          const existingUIMessage = uiMessages[streamId];
          const [[uiMessage], [streamMetadata], changed] =
            deriveUIMessagesFromTextStreamParts(
              threadId,
              [streamMessage],
              existingUIMessage
                ? [
                    {
                      streamId,
                      cursor: streamCursors[streamId] ?? 0,
                      message: toUIMessages(existingUIMessage)[0],
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
              [streamId]: fromUIMessages([uiMessage], {
                threadId,
                ...streamMessage,
              }),
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
    setMessages((prev) => {
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
    return sorted(Array.from(Object.values(messages)).flat());
  }, [messages, loading]);
}
