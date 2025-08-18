import type { Infer } from "convex/values";
import { expectTypeOf, test } from "vitest";
import type { ContextOptions, StorageOptions } from "./client/types.js";
import { vContextOptions, vStorageOptions } from "./validators.js";

expectTypeOf<Infer<typeof vContextOptions>>().toExtend<ContextOptions>();
expectTypeOf<ContextOptions>().toExtend<Infer<typeof vContextOptions>>();

expectTypeOf<Infer<typeof vStorageOptions>>().toExtend<StorageOptions>();
expectTypeOf<StorageOptions>().toExtend<Infer<typeof vStorageOptions>>();

test("noop", () => {});
