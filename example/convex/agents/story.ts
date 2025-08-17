// See the docs at https://docs.convex.dev/agents/getting-started
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";
import { defaultConfig } from "./config";

// Define an agent similarly to the AI SDK
export const storyAgent = new Agent(components.agent, {
  name: "Story Agent",
  instructions: "You tell stories with twist endings. ~ 200 words.",
  ...defaultConfig,
});
