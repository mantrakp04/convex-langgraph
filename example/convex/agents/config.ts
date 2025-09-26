import { type Config } from "@convex-dev/agent";
import { languageModel, textEmbeddingModel } from "../modelsForDemo";
import { rawRequestResponseHandler } from "../debugging/rawRequestResponseHandler";
import { usageHandler } from "../usage_tracking/usageHandler";

export const defaultConfig = {
  languageModel,
  rawRequestResponseHandler,
  usageHandler,
  callSettings: {
    temperature: 1.0,
  },
  // If you want to use vector search, you need to set this.
  textEmbeddingModel,
  // Enable built-in memory tools (append/replace core memory, message search)
  memoryTools: true,
  mcpConfig: {
    adapter: "flyio",
    config: {
      apiToken: process.env.FLY_API_TOKEN,
      orgSlug: process.env.FLY_ORG_SLUG || "personal",
      jwtPrivateKey: process.env.JWT_PRIVATE_KEY || ""
    },
  },
} satisfies Config;
