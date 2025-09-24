"use client";
import {
  type BetterOmit,
  type ErrorMessage,
  type Expand,
} from "convex-helpers";
import { usePaginatedQuery } from "convex-helpers/react";
import {
  type PaginatedQueryArgs,
  type UsePaginatedQueryResult,
} from "convex/react";
import type {
  FunctionArgs,
  FunctionReference,
  PaginationOptions,
  PaginationResult,
} from "convex/server";
import { useMemo } from "react";
import type { SyncStreamsReturnValue } from "../client/types.js";
import type { StreamArgs } from "../validators.js";
import type { StreamQuery } from "./types.js";
import {
  type UIMessage,
  type UIStatus,
  combineUIMessages,
} from "../UIMessages.js";
import { sorted } from "../shared.js";
import { useStreamingUIMessages } from "./useStreamingUIMessages.js";

export type UIMessageLike = {
  order: number;
  stepOrder: number;
  status: UIStatus;
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
 *     // NOTE: listUIMessages returns UIMessages, not MessageDocs.
 *     const paginated = await listUIMessages(ctx, components.agent, args);
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
    skipStreamIds?: string[];
  },
): UsePaginatedQueryResult<UIMessagesQueryResult<Query>> {
  // These are full messages
  const paginated = usePaginatedQuery(
    query,
    args as PaginatedQueryArgs<Query> | "skip",
    { initialNumItems: options.initialNumItems },
  );

  const startOrder = paginated.results.length
    ? Math.min(...paginated.results.map((m) => m.order))
    : 0;
  // These are streaming messages that will not include full messages.
  const streamMessages = useStreamingUIMessages(
    query as StreamQuery<UIMessagesQueryArgs<Query>>,
    !options.stream ||
      args === "skip" ||
      paginated.status === "LoadingFirstPage"
      ? "skip"
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ({ ...args, paginationOpts: { cursor: null, numItems: 0 } } as any),
    { startOrder, skipStreamIds: options.skipStreamIds },
  );

  const merged = useMemo(() => {
    // Messages may have been split by pagination. Re-combine them here.
    const combined = combineUIMessages(sorted(paginated.results));
    return {
      ...paginated,
      results: dedupeMessages(combined, streamMessages ?? []),
    };
  }, [paginated, streamMessages]);

  return merged as UIMessagesQueryResult<Query>;
}

export function dedupeMessages<
  M extends {
    order: number;
    stepOrder: number;
    status: UIStatus;
  },
>(messages: M[], streamMessages: M[]): M[] {
  return sorted(messages.concat(streamMessages)).reduce((msgs, msg) => {
    const last = msgs.at(-1);
    if (!last) {
      return [msg];
    }
    if (last.order !== msg.order || last.stepOrder !== msg.stepOrder) {
      return [...msgs, msg];
    }
    if (
      (last.status === "pending" || last.status === "streaming") &&
      msg.status !== "pending"
    ) {
      // Let's prefer a streaming or finalized message over a pending
      // one.
      return [...msgs.slice(0, -1), msg];
    }
    // skip the new one if the previous one (listed) was finalized
    return msgs;
  }, [] as M[]);
}
