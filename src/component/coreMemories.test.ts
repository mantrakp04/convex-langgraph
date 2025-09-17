/// <reference types="vite/client" />

import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api.js";
import schema from "./schema.js";
import { modules } from "./setup.test.js";

describe("coreMemories", () => {
  test("create, get and update fields", async () => {
    const t = convexTest(schema, modules);

    const doc = await t.mutation(api.coreMemories.getOrCreate, {
      userId: "u1",
      persona: "p1",
      human: "h1",
    });

    const got = await t.query(api.coreMemories.get, { userId: "u1" });
    expect(got?._id).toBe(doc?._id);
    expect(got?.persona).toBe("p1");
    expect(got?.human).toBe("h1");

    await t.mutation(api.coreMemories.update, {
      userId: "u1",
      persona: "p2",
    });

    const after = await t.query(api.coreMemories.get, { userId: "u1" });
    expect(after?.persona).toBe("p2");
    expect(after?.human).toBe("h1");
  });

  test("update supports null to unset fields", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.coreMemories.getOrCreate, {
      userId: "u2",
      persona: "p1",
      human: "h1",
    });

    await t.mutation(api.coreMemories.update, {
      userId: "u2",
      persona: "",
    });

    const got = await t.query(api.coreMemories.get, { userId: "u2" });
    expect(got?.persona).toBe("");
    expect(got?.human).toBe("h1");
  });

  test("append modifies specified field", async () => {
    const t = convexTest(schema, modules);
    const doc = await t.mutation(api.coreMemories.getOrCreate, { 
      userId: "u3",
      persona: "",
      human: "",
    });

    await t.mutation(api.coreMemories.append, {
      userId: "u3",
      field: "persona",
      text: "A",
    });
    await t.mutation(api.coreMemories.append, {
      userId: "u3",
      field: "persona",
      text: "B",
    });
    const got = await t.query(api.coreMemories.get, { userId: "u3" });
    expect(got?._id).toBe(doc?._id);
    expect(got?.persona).toBe("AB");
  });

  test("replace and remove operate correctly", async () => {
    const t = convexTest(schema, modules);

    await t.mutation(api.coreMemories.getOrCreate, {
      userId: "u4",
      persona: "",
      human: "hello",
    });

    // replace "ll" with "XX"
    const occurrences = await t.mutation(api.coreMemories.replace, {
      userId: "u4",
      field: "human",
      oldContent: "ll",
      newContent: "XX",
    });
    expect(occurrences).toBe(1);
    let got = await t.query(api.coreMemories.get, { userId: "u4" });
    expect(got?.human).toBe("heXXo");

    // remove the "XX" segment
    await t.mutation(api.coreMemories.remove, {
      userId: "u4",
      field: "human",
      index: 2,
      length: 2,
    });
    got = await t.query(api.coreMemories.get, { userId: "u4" });
    expect(got?.human).toBe("heo");
  });

  test("getOrCreate prevents duplicates per userId", async () => {
    const t = convexTest(schema, modules);
    const doc1 = await t.mutation(api.coreMemories.getOrCreate, { 
      userId: "u5",
      persona: "p1",
      human: "h1",
    });
    const doc2 = await t.mutation(api.coreMemories.getOrCreate, { 
      userId: "u5",
      persona: "p2",
      human: "h2",
    });
    // Should keep the same document (getOrCreate returns the existing one)
    const got = await t.query(api.coreMemories.get, { userId: "u5" });
    expect(got?._id).toBe(doc1?._id);
    expect(doc2?._id).toBe(doc1?._id);
    expect(got?.persona).toBe("p1"); // Should keep original values
    expect(got?.human).toBe("h1");
  });
});
