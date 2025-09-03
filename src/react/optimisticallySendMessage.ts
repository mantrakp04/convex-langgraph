import { insertAtTop } from "convex/react";
import type { MessageDoc } from "../client/index.js";
import type { OptimisticLocalStore } from "convex/browser";
import type { ThreadQuery } from "./types.js";
import type { UIMessage } from "./toUIMessages.js";

export function optimisticallySendUIMessage(
  query: ThreadQuery<unknown, UIMessage>,
): (
  store: OptimisticLocalStore,
  args: { threadId: string; prompt: string },
) => void {
  return (store, args) => {
    const queries = store.getAllQueries(query);
    let maxOrder = -1;
    for (const q of queries) {
      if (q.args?.threadId !== args.threadId) continue;
      if (q.args.streamArgs) continue;
      for (const m of q.value?.page ?? []) {
        maxOrder = Math.max(maxOrder, m.order);
      }
    }
    const order = maxOrder + 1;
    const stepOrder = 0;
    insertAtTop({
      paginatedQuery: query,
      argsToMatch: { threadId: args.threadId, streamArgs: undefined },
      item: {
        id: crypto.randomUUID(),
        key: `${args.threadId}-${order}-${stepOrder}`,
        order,
        stepOrder,
        status: "pending",
        text: args.prompt,
        _creationTime: Date.now(),
        role: "user",
        parts: [{ type: "text", text: args.prompt }],
      },
      localQueryStore: store,
    });
  };
}

export function optimisticallySendMessage(
  query: ThreadQuery<unknown, MessageDoc>,
): (
  store: OptimisticLocalStore,
  args: { threadId: string; prompt: string },
) => void {
  return (store, args) => {
    const queries = store.getAllQueries(query);
    let maxOrder = -1;
    for (const q of queries) {
      if (q.args?.threadId !== args.threadId) continue;
      if (q.args.streamArgs) continue;
      for (const m of q.value?.page ?? []) {
        maxOrder = Math.max(maxOrder, m.order);
      }
    }
    const order = maxOrder + 1;
    insertAtTop({
      paginatedQuery: query,
      argsToMatch: { threadId: args.threadId, streamArgs: undefined },
      item: {
        _creationTime: Date.now(),
        _id: randomUUID(),
        order,
        stepOrder: 0,
        status: "pending",
        threadId: args.threadId,
        tool: false,
        message: { role: "user", content: args.prompt },
        text: args.prompt,
      },
      localQueryStore: store,
    });
  };
}

export function randomUUID() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}
