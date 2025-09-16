import { assert } from "convex-helpers";
import {
  action,
  internalQuery,
  mutation,
  query,
} from "./_generated/server.js";
import { v } from "./schema.js";
import { api, internal } from "./_generated/api.js";
import { vVectorId, validateVectorDimension, type VectorTableId } from "./vector/tables.js";
import { insertVector, searchVectors } from "./vector/index.js";
import type { Doc } from "./_generated/dataModel.js";
import * as schema from "./schema.js";

export const get = query({
  args: {
    userId: v.optional(v.string()),
    memoryId: v.id("memories"),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.memoryId);
    assert(doc && (args.userId ? doc.userId === args.userId : true), `Memory ${args.memoryId} not found`);
    return doc;
  },
});

export const add = mutation({
  args: {
    userId: v.optional(v.string()),
    memory: v.string(),
    embedding: v.optional(
      v.object({ model: v.string(), vector: v.array(v.number()) }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = args.userId;
    let embeddingId: VectorTableId | undefined;
    if (args.embedding) {
      const dimension = args.embedding.vector.length;
      validateVectorDimension(dimension);
      embeddingId = await insertVector(ctx, dimension, {
        model: args.embedding.model,
        vector: args.embedding.vector,
        table: "memories",
        userId,
      });
    }
    return await ctx.db.insert("memories", {
      userId,
      memory: args.memory,
      embeddingId,
    });
  },
});

export const modify = mutation({
  args: {
    memoryId: v.id("memories"),
    patch: v.object({ memory: v.optional(v.string()) }),
    embedding: v.optional(
      v.union(
        v.null(),
        v.object({ model: v.string(), vector: v.array(v.number()) }),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.memoryId);
    assert(doc, `Memory ${args.memoryId} not found`);

    // Handle embedding update
    if (args.embedding !== undefined) {
      if (doc.embeddingId) {
        await ctx.db.delete(doc.embeddingId);
      }
      let embeddingId: VectorTableId | undefined = undefined;
      if (args.embedding) {
        const dimension = args.embedding.vector.length;
        validateVectorDimension(dimension);
        embeddingId = await insertVector(ctx, dimension, {
          model: args.embedding.model,
          vector: args.embedding.vector,
          table: "memories",
          userId: doc.userId,
        });
      }
      await ctx.db.patch(args.memoryId, { embeddingId });
    }

    if (args.patch && Object.keys(args.patch).length > 0) {
      await ctx.db.patch(args.memoryId, args.patch);
    }
    return (await ctx.db.get(args.memoryId))!;
  },
});

export const remove = mutation({
  args: { memoryId: v.id("memories") },
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.memoryId);
    if (!doc) return null;
    if (doc.embeddingId) {
      await ctx.db.delete(doc.embeddingId);
    }
    await ctx.db.delete(args.memoryId);
    return null;
  },
});

export const list = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("memories")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const fetchSearchMemories = internalQuery({
  args: {
    embeddingIds: v.array(vVectorId),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assert(
      args.userId,
      "Specify userId to search",
    );
    const docs = (
      await Promise.all(
        args.embeddingIds.map((embeddingId) =>
          ctx.db
            .query("memories")
            .withIndex("embeddingId", (q) => q.eq("embeddingId", embeddingId))
            .filter((q) =>
              args.userId
                ? q.eq(q.field("userId"), args.userId) : true
            )
            .first(),
        ),
      )
    )
      .filter((m): m is NonNullable<typeof m> => m !== undefined && m !== null)
    return docs;
  },
});

export const search = action({
  args: {
    userId: v.optional(v.string()),
    targetMessageId: v.optional(v.id("messages")),
    embedding: v.optional(v.array(v.number())),
    embeddingModel: v.optional(v.string()),
    limit: v.number(),
    vectorScoreThreshold: v.optional(v.number()),
  },
  returns: v.array(schema.schema.tables.memories.validator),
  handler: async (ctx, args): Promise<Doc<"memories">[]> => {
    let embedding = args.embedding;
    let model = args.embeddingModel;

    if (!embedding) {
      if (args.targetMessageId) {
        const target = await ctx.runQuery(api.messages.getMessageSearchFields, {
          messageId: args.targetMessageId,
        });
        embedding = target.embedding;
        model = target.embeddingModel;
      }
    }

    if (!embedding || !model) {
      // If we don't have an embedding or model to search with, we can't perform vector search.
      // Return no memories rather than throwing to allow callers to proceed without archival memory.
      return [];
    }
    const dimension = embedding.length;
    validateVectorDimension(dimension);

    const vectors = (
      await searchVectors(ctx, embedding, {
        dimension,
        model,
        table: "memories",
        userId: args.userId,
        limit: args.limit,
      })
    ).filter((v) => v._score > (args.vectorScoreThreshold ?? 0));

    const embeddingIds = vectors.map((v) => v._id);
    const memories = await ctx.runQuery(internal.memories.fetchSearchMemories, {
      embeddingIds,
      userId: args.userId,
    });
    return memories;
  },
});
