import type { TextStreamPart, ToolSet } from "ai";
import {
  TextStreamPartSupportedTypes,
  vTextStreamPartV5,
  type TextStreamPartV5,
} from "./validators.js";
import { parse } from "convex-helpers/validators";

export function serializeTextStreamingPartsV5(
  parts: (TextStreamPart<ToolSet> | TextStreamPartV5)[],
): TextStreamPartV5[] {
  const compressed: TextStreamPartV5[] = [];
  for (const part of parts) {
    if (!TextStreamPartSupportedTypes.some((t) => t === part.type)) {
      continue;
    }
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
          file: { mediaType: part.file.mediaType, base64: part.file.base64 },
        });
      }
      compressed.push(parse(vTextStreamPartV5, part));
    }
  }
  return compressed;
}
