import type { Infer } from "convex/values";
import { expectTypeOf, test } from "vitest";
import type {
  ContextOptions,
  OpaqueIds,
  StorageOptions,
} from "./client/types.js";
import { vContextOptions, vMessageDoc, vStorageOptions } from "./validators.js";
import type { Doc } from "./component/_generated/dataModel.js";

expectTypeOf<Infer<typeof vContextOptions>>().toExtend<ContextOptions>();
expectTypeOf<ContextOptions>().toExtend<Infer<typeof vContextOptions>>();

expectTypeOf<Infer<typeof vStorageOptions>>().toExtend<StorageOptions>();
expectTypeOf<StorageOptions>().toExtend<Infer<typeof vStorageOptions>>();

type MessageBasedOnSchema = OpaqueIds<
  Omit<Doc<"messages">, "files" | "stepId" | "parentMessageId">
>;
expectTypeOf<Infer<typeof vMessageDoc>>().toEqualTypeOf<MessageBasedOnSchema>();
expectTypeOf<MessageBasedOnSchema>().toEqualTypeOf<Infer<typeof vMessageDoc>>();

test("noop", () => {});
