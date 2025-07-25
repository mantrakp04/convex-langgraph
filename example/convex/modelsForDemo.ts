import { openrouter, LanguageModelV1 } from "@openrouter/ai-sdk-provider";
import type { EmbeddingModel, LanguageModelV1StreamPart } from "ai";
import { MockLanguageModelV1 } from "ai/test";
import { openai } from "@ai-sdk/openai";
import { groq } from "@ai-sdk/groq";
import { simulateReadableStream } from "ai";

let chat: LanguageModelV1;
let textEmbedding: EmbeddingModel<string>;

if (process.env.OPENAI_API_KEY) {
  chat = openai.chat("gpt-4o-mini");
  textEmbedding = openai.textEmbeddingModel("text-embedding-3-small");
} else if (process.env.GROQ_API_KEY) {
  chat = groq.languageModel("meta-llama/llama-4-scout-17b-16e-instruct");
} else if (process.env.OPENROUTER_API_KEY) {
  chat = openrouter.chat("openai/gpt-4o-mini");
} else {
  console.warn("⚠️ No API key found, using mock model");
  console.warn(
    "Run `npx convex env set GROQ_API_KEY=<your-api-key>` or `npx convex env set OPENAI_API_KEY=<your-api-key>` or `npx convex env set OPENROUTER_API_KEY=<your-api-key>` from the example directory to set the API key.",
  );
  chat = mockModel();
}

function mockModel(): LanguageModelV1 {
  return new MockLanguageModelV1({
    provider: "mock",
    modelId: "mock",
    defaultObjectGenerationMode: "json",
    // supportsStructuredOutputs: true,
    doGenerate: async ({ prompt }) => ({
      finishReason: "stop",
      usage: { completionTokens: 10, promptTokens: 3 },
      logprobs: undefined,
      rawCall: { rawPrompt: null, rawSettings: {} },
      text: JSON.stringify({ prompt }),
    }),
    doStream: async ({ prompt }) => ({
      stream: simulateReadableStream({
        chunkDelayInMs: 50,
        initialDelayInMs: 100,
        chunks: [
          ...`This is a mock response to ${JSON.stringify(prompt)}`
            .split(" ")
            .map((textDelta) => ({
              type: "text-delta",
              textDelta,
            })),
          {
            type: "finish",
            finishReason: "stop",
            logprobs: undefined,
            usage: { completionTokens: 10, promptTokens: 3 },
          },
        ] as LanguageModelV1StreamPart[],
      }),
      rawCall: { rawPrompt: null, rawSettings: {} },
    }),
  });
}


// If you want to use different models for examples, you can change them here.
export { chat, textEmbedding };
