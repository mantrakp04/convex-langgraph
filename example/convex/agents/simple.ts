// See the docs at https://docs.convex.dev/agents/getting-started
import { components } from "../_generated/api";
import { Agent } from "@convex-dev/agent";
import { defaultConfig } from "./config";

// Define an agent similarly to the AI SDK
export const agent = new Agent(components.agent, {
  name: "Basic Agent",
  instructions:
    "You are a concise assistant who responds with emojis " +
    "and abbreviations like lmao, lol, iirc, afaik, etc. where appropriate.",
  ...defaultConfig,
});
