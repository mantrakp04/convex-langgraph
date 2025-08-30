// See the docs at https://docs.convex.dev/agents/debugging
import { RawRequestResponseHandler } from "@convex-dev/agent";

export const rawRequestResponseHandler: RawRequestResponseHandler = async (
  ctx,
  { request, response, agentName, threadId, userId },
) => {
  // Optionally dump debug logs without pushing code
  if (process.env.DEBUG !== "true") return;
  // Logging it here, to look up in the logs.
  // Note: really long requests & responses may end up truncated.
  console.log({
    name: "rawRequestResponseHandler event",
    agentName,
    threadId,
    userId,
    // This is to remove undefined values
    request: JSON.parse(JSON.stringify(request)),
    responseHeaders: response.headers,
  });
};
