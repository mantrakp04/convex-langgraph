/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api, internal } from "./_generated/api.js";
import type { Id } from "./_generated/dataModel.js";
import schema from "./schema.js";
import { modules } from "./setup.test.js";

describe("memories", () => {
  test("add, get, list and remove basic memory", async () => {
    const t = convexTest(schema, modules);

    // add
    const memoryId = await t.mutation(api.memories.add, {
      userId: "user1",
      memory: "alpha",
    });

    // get
    const fetched = await t.query(api.memories.get, {
      userId: "user1",
      memoryId: memoryId as Id<"memories">,
    });
    expect(fetched?.memory).toBe("alpha");
    expect(fetched?.userId).toBe("user1");

    // list
    const list = await t.query(api.memories.list, { userId: "user1", limit: 10 });
    expect(list).toHaveLength(1);
    expect(list[0]._id).toBe(memoryId);

    // remove
    await t.mutation(api.memories.remove, { memoryId: memoryId as Id<"memories"> });
    const after = await t.query(api.memories.list, { userId: "user1", limit: 10 });
    expect(after).toHaveLength(0);
  });

  test("add with embedding creates vector row and modify updates it", async () => {
    const t = convexTest(schema, modules);

    // Add with embedding
    const id = await t.mutation(api.memories.add, {
      userId: "u2",
      memory: "with embedding",
      embedding: { model: "test-model", vector: Array.from({ length: 128 }, (_, i) => i) },
    });

    const got1 = await t.query(api.memories.get, {
      userId: "u2",
      memoryId: id as Id<"memories">,
    });
    expect(got1?.embeddingId).toBeTruthy();

    // Modify memory text only
    const updated1 = await t.mutation(api.memories.modify, {
      memoryId: id as Id<"memories">,
      patch: { memory: "updated" },
    });
    expect(updated1.memory).toBe("updated");
    expect(updated1.embeddingId).toBe(got1!.embeddingId);

    // Modify embedding: replace with a new vector
    const updated2 = await t.mutation(api.memories.modify, {
      memoryId: id as Id<"memories">,
      patch: {},
      embedding: { model: "test-model", vector: Array.from({ length: 128 }, () => 1) },
    });
    expect(updated2.embeddingId).toBeTruthy();
    expect(updated2.embeddingId).not.toBe(got1!.embeddingId);

    // Remove embedding: pass null
    const updated3 = await t.mutation(api.memories.modify, {
      memoryId: id as Id<"memories">,
      patch: {},
      embedding: null,
    });
    expect(updated3.embeddingId).toBeUndefined();
  });

  test("fetchSearchMemories returns docs by embeddingIds and filters by userId", async () => {
    const t = convexTest(schema, modules);

    // Insert memories with embeddings for two users
    const id1 = await t.mutation(api.memories.add, {
      userId: "searchUser1",
      memory: "first",
      embedding: { model: "test-model", vector: Array.from({ length: 128 }, () => 0) },
    });
    const id2 = await t.mutation(api.memories.add, {
      userId: "searchUser2",
      memory: "second",
      embedding: { model: "test-model", vector: Array.from({ length: 128 }, () => 0.001) },
    });

    const m1 = await t.query(api.memories.get, { userId: "searchUser1", memoryId: id1 as Id<"memories"> });
    const m2 = await t.query(api.memories.get, { userId: "searchUser2", memoryId: id2 as Id<"memories"> });

    // Fetch by both embeddingIds but with user filter
    const results1 = await t.query(internal.memories.fetchSearchMemories, {
      embeddingIds: [m1!.embeddingId!, m2!.embeddingId!],
      userId: "searchUser1",
    });

    expect(results1).toHaveLength(1);
    expect(results1[0]._id).toBe(id1);

    const results2 = await t.query(internal.memories.fetchSearchMemories, {
      embeddingIds: [m1!.embeddingId!, m2!.embeddingId!],
      userId: "searchUser2",
    });

    expect(results2).toHaveLength(1);
    expect(results2[0]._id).toBe(id2);
  });
});
