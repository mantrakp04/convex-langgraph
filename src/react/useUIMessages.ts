"use client";
import {
  omit,
  type BetterOmit,
  type ErrorMessage,
  type Expand,
} from "convex-helpers";
import {
  usePaginatedQuery,
  useQuery,
  type PaginatedQueryArgs,
  type UsePaginatedQueryResult,
} from "convex/react";
import type {
  FunctionArgs,
  FunctionReference,
  PaginationOptions,
  PaginationResult,
} from "convex/server";
import { useMemo, useState, useEffect, useRef } from "react";
import {
  readUIMessageStream,
  type TextUIPart,
  type UIDataTypes,
  type UIMessageChunk,
  type UITools,
} from "ai";
import type { SyncStreamsReturnValue } from "../client/types.js";
import type { MessageStatus, StreamArgs } from "../validators.js";
import type { StreamQuery, StreamMessagesArgs } from "./types.js";
import { type UIMessage } from "../UIMessages.js";
import {
  blankUIMessage,
  getParts,
  deriveUIMessagesFromTextStreamParts,
  statusFromStreamStatus,
} from "../deltas.js";
import { sorted } from "../shared.js";

export type UIMessageLike = {
  order: number;
  stepOrder: number;
  status: MessageStatus | "streaming";
  parts: UIMessage["parts"];
  role: UIMessage["role"];
};

export type UIMessagesQuery<
  Args = unknown,
  M extends UIMessageLike = UIMessageLike,
> = FunctionReference<
  "query",
  "public",
  {
    threadId: string;
    paginationOpts: PaginationOptions;
    /**
     * If { stream: true } is passed, it will also query for stream deltas.
     * In order for this to work, the query must take as an argument streamArgs.
     */
    streamArgs?: StreamArgs;
  } & Args,
  PaginationResult<M> & { streams?: SyncStreamsReturnValue }
>;

export type UIMessagesQueryArgs<
  Query extends UIMessagesQuery<unknown, UIMessageLike>,
> =
  Query extends UIMessagesQuery<unknown, UIMessageLike>
    ? Expand<BetterOmit<FunctionArgs<Query>, "paginationOpts" | "streamArgs">>
    : never;

export type UIMessagesQueryResult<
  Query extends UIMessagesQuery<unknown, UIMessageLike>,
> = Query extends UIMessagesQuery<unknown, infer M> ? M : never;

/**
 * A hook that fetches UIMessages from a thread.
 *
 * It's similar to useThreadMessages, for endpoints that return UIMessages.
 * The streaming messages are materialized as UIMessages. The rest are passed
 * through from the query.
 *
 * This hook is a wrapper around `usePaginatedQuery` and `useStreamingUIMessages`.
 * It will fetch both full messages and streaming messages, and merge them together.
 *
 * The query must take as arguments `{ threadId, paginationOpts }` and return a
 * pagination result of objects similar to UIMessage:
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
 *   handler: async (ctx, args) => {
 *     // await authorizeThreadAccess(ctx, threadId);
 *     const paginated = listUIMessages(ctx, components.agent, args);
 *     const streams = await syncStreams(ctx, components.agent, args);
 *     // Here you could filter out / modify the documents & stream deltas.
 *     return { ...paginated, streams };
 *   },
 * });
 * ```
 *
 * Then the hook can be used like this:
 * ```ts
 * const { results, status, loadMore } = useUIMessages(
 *   api.myModule.listThreadMessages,
 *   { threadId },
 *   { initialNumItems: 10, stream: true }
 * );
 * ```
 *
 * @param query The query to use to fetch messages.
 * It must take as arguments `{ threadId, paginationOpts }` and return a
 * pagination result of objects similar to UIMessage:
 * Required fields: (role, parts, status, order, stepOrder).
 * To support streaming, it must also take in `streamArgs: vStreamArgs` and
 * return a `streams` object returned from `syncStreams`.
 * @param args The arguments to pass to the query other than `paginationOpts`
 * and `streamArgs`. So `{ threadId }` at minimum, plus any other arguments that
 * you want to pass to the query.
 * @param options The options for the query. Similar to usePaginatedQuery.
 * To enable streaming, pass `stream: true`.
 * @returns The messages. If stream is true, it will return a list of messages
 *   that includes both full messages and streaming messages.
 *   The streaming messages are materialized as UIMessages. The rest are passed
 *   through from the query.
 */
export function useUIMessages<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Query extends UIMessagesQuery<any, any>,
>(
  query: Query,
  args: UIMessagesQueryArgs<Query> | "skip",
  options: {
    initialNumItems: number;
    stream?: Query extends StreamQuery
      ? boolean
      : ErrorMessage<"To enable streaming, your query must take in streamArgs: vStreamArgs and return a streams object returned from syncStreams. See docs.">;
  },
): UsePaginatedQueryResult<
  UIMessagesQueryResult<Query> & { streaming: boolean }
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
  const streamMessages = useStreamingUIMessages(
    query as StreamQuery<UIMessagesQueryArgs<Query>>,
    !options.stream ||
      args === "skip" ||
      paginated.status === "LoadingFirstPage"
      ? "skip"
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ ...args, paginationOpts: { cursor: null, numItems: 0 } } as any),
    { startOrder },
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
        [] as (UIMessagesQueryResult<Query> & {
          streaming: boolean;
        })[],
      ),
    };
  }, [paginated, streamMessages]);

  return merged as UIMessagesQueryResult<Query> & {
    streaming: boolean;
  };
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
  args: StreamMessagesArgs<Query> | "skip",
  options?: {
    startOrder?: number;
    skipStreamIds?: string[];
  },
  // TODO: make generic on metadata, etc.
): UIMessage<METADATA, DATA_PARTS, TOOLS>[] | undefined {
  const [uiMessages, setUIMessages] = useState<
    Record<string, UIMessage<METADATA, DATA_PARTS, TOOLS>>
  >({});
  const [streamCursors, setStreamCursors] = useState<Record<string, number>>(
    {},
  );
  const uiMessageStreamControllers = useRef<
    Map<string, ReadableStreamDefaultController<UIMessageChunk>>
  >(new Map());

  // Get all the active streams
  const streamList = useQuery(
    query,
    args === "skip"
      ? args
      : ({
          ...args,
          streamArgs: {
            kind: "list",
            startOrder: options?.startOrder ?? 0,
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
    args === "skip" || !streamList
      ? ("skip" as const)
      : ({
          ...args,
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
              [streamId]: initialMessage as UIMessage<
                METADATA,
                DATA_PARTS,
                TOOLS
              >,
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
                message.text = message.parts
                  .filter((p) => p.type === "text")
                  .map((p) => p.text)
                  .join("");
                setUIMessages((prev) =>
                  // If we don't have a ui message assume we've aborted.
                  prev[streamId]
                    ? {
                        ...prev,
                        [streamId]: message as UIMessage<
                          METADATA,
                          DATA_PARTS,
                          TOOLS
                        >,
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
          const [[uiMessage], [streamMetadata], changed] =
            deriveUIMessagesFromTextStreamParts(
              threadId,
              [streamMessage],
              existingUIMessage
                ? [
                    {
                      streamId,
                      cursor: streamCursors[streamId] ?? 0,
                      message: existingUIMessage,
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
              [streamId]: uiMessage as UIMessage<METADATA, DATA_PARTS, TOOLS>,
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

  return useMemo(() => {
    if (!streamList) return undefined;
    return sorted(
      Array.from(
        Object.entries(uiMessages)
          .map(([streamId, uiMessage]) => {
            const streamMessage = streamList?.streams.messages.find(
              (m) => m.streamId === streamId,
            );
            if (!streamMessage) return undefined;
            uiMessage.status = statusFromStreamStatus(
              streamMessage?.status ?? "finished",
            );
            uiMessage.text = uiMessage.parts
              .filter((p): p is TextUIPart => p.type === "text")
              .map((p) => p.text)
              .join("");
            return uiMessage;
          })
          .filter((uiMessage) => uiMessage !== undefined),
      ),
    );
  }, [uiMessages, streamList]);
}
