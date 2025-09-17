import { assert } from "convex-helpers";
import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";
import { vCoreMemory, vCoreMemoryDoc } from "../validators.js";

export const get = query({
  args: {
    userId: v.optional(v.string()),
  },
  returns: v.union(v.null(), vCoreMemoryDoc),
  handler: async (ctx, args) => {
    return await ctx.db.query("coreMemories").withIndex("userId", (q) => q.eq("userId", args.userId)).first();
  },
});

export const getOrCreate = mutation({
  args: vCoreMemory,
  returns: v.union(v.null(), vCoreMemoryDoc),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("coreMemories")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    if (doc) {
      assert(doc.userId === args.userId, `Core memory for user ${args.userId} already exists`);
      return doc;
    }
    const id = await ctx.db.insert("coreMemories", args);
    return await ctx.db.get(id);
  },
});

export const update = mutation({
  args: {
    userId: v.optional(v.string()),
    persona: v.optional(v.string()),
    human: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("coreMemories")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    assert(doc, `Core memory for user ${args.userId} not found`);
    await ctx.db.patch(doc._id, {
      ...(args.persona !== undefined ? { persona: args.persona ?? undefined } : {}),
      ...(args.human !== undefined ? { human: args.human ?? undefined } : {}),
    });
    return null;
  },
});

export const append = mutation({
  args: {
    userId: v.optional(v.string()),
    field: v.union(v.literal("persona"), v.literal("human")),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("coreMemories")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    assert(doc, `Core memory for user ${args.userId} not found`);
    const base = (doc[args.field] as string | undefined) ?? "";
    await ctx.db.patch(doc._id, { [args.field]: base + args.text });
    return null;
  },
});

export const replace = mutation({
  args: {
    userId: v.optional(v.string()),
    field: v.union(v.literal("persona"), v.literal("human")),
    oldContent: v.string(),
    newContent: v.string(),
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("coreMemories")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    assert(doc, `Core memory for user ${args.userId} not found`);
    const base = (doc[args.field] as string | undefined) ?? "";
    
    if (args.oldContent === "") {
      throw new Error("oldContent must be non-empty for replacement");
    }
    
    const occurrences = base.split(args.oldContent).length - 1;
    const updated = occurrences > 0
      ? base.split(args.oldContent).join(args.newContent)
      : base;
    
    await ctx.db.patch(doc._id, { [args.field]: updated });
    return occurrences;
  },
});

export const remove = mutation({
  args: {
    userId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("coreMemories")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .first();
    assert(doc, `Core memory for user ${args.userId} not found`);
    await ctx.db.delete(doc._id);
    return null;
  },
});
