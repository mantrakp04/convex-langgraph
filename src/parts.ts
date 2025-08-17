import type { TextStreamPart, ToolSet } from "ai";

export function serializeTextStreamingPartsV5(
  parts: TextStreamPart<ToolSet>[],
): TextStreamPart<ToolSet>[] {
  const compressed: TextStreamPart<ToolSet>[] = [];
  for (const part of parts) {
    const last = compressed.at(-1);
    if (part.type === "text-delta" && last?.type === "text-delta") {
      last.text += part.text;
    } else if (
      part.type === "reasoning-delta" &&
      last?.type === "reasoning-delta"
    ) {
      last.text += part.text;
    } else {
      if (
        part.type === "start-step" ||
        part.type === "finish-step" ||
        part.type === "start" ||
        part.type === "finish"
      ) {
        continue;
      }
      if (part.type === "file") {
        compressed.push({
          type: "file",
          file: {
            mediaType: part.file.mediaType,
            base64: part.file.base64,
            uint8Array: new Uint8Array([]),
          },
        });
      }
      compressed.push(part);
    }
  }
  return compressed;
}
