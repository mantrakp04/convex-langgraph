import type { BetterOmit, Expand } from "convex-helpers";
import type {
  FunctionArgs,
  FunctionReference,
  PaginationOptions,
  PaginationResult,
} from "convex/server";
import type { SyncStreamsReturnValue } from "../client/types.js";
import type { MessageStatus, StreamArgs } from "../validators.js";
import type { UIMessage as AIUIMessage, UIDataTypes, UITools } from "ai";

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

export type MessageLike = {
  order: number;
  stepOrder: number;
  status: MessageStatus | "streaming";
};

export type ThreadQuery<
  Args = unknown,
  M extends MessageLike = MessageLike,
> = FunctionReference<
  "query",
  "public",
  {
    threadId: string;
    paginationOpts: PaginationOptions;
    // TODO: will this allow passing a function that doesn't have this param?
    /**
     * If { stream: true } is passed, it will also query for stream deltas.
     * In order for this to work, the query must take as an argument streamArgs.
     */
    streamArgs?: StreamArgs;
  } & Args,
  PaginationResult<M> & { streams?: SyncStreamsReturnValue }
>;

export type ThreadMessagesArgs<
  Query extends ThreadQuery<unknown, MessageLike>,
> =
  Query extends ThreadQuery<unknown, MessageLike>
    ? Expand<BetterOmit<FunctionArgs<Query>, "paginationOpts" | "streamArgs">>
    : never;

export type StreamQuery<Args = Record<string, unknown>> = FunctionReference<
  "query",
  "public",
  {
    threadId: string;
    streamArgs?: StreamArgs; // required for stream query
  } & Args,
  { streams: SyncStreamsReturnValue }
>;

export type StreamMessagesArgs<Query extends StreamQuery<unknown>> =
  Query extends StreamQuery<unknown>
    ? Expand<BetterOmit<FunctionArgs<Query>, "streamArgs">>
    : never;

export type ThreadMessagesResult<
  Query extends ThreadQuery<unknown, MessageLike>,
> = Query extends ThreadQuery<unknown, infer M> ? M : never;
