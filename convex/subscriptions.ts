import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

export const upsertSubscription = internalMutation({
  args: {
    polarId: v.string(),
    userId: v.string(),
    productId: v.string(),
    status: v.string(),
    currentPeriodStart: v.optional(v.string()),
    currentPeriodEnd: v.optional(v.string()),
    cancelAtPeriodEnd: v.boolean(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_id", (q) => q.eq("polarId", args.polarId))
      .first();
      
    if (existing) {
      await ctx.db.patch(existing._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("subscriptions", {
        ...args,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

export const cancelSubscription = internalMutation({
  args: {
    polarId: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("subscriptions")
      .withIndex("by_polar_id", (q) => q.eq("polarId", args.polarId))
      .first();
      
    if (subscription) {
      await ctx.db.patch(subscription._id, {
        status: "canceled",
        updatedAt: Date.now(),
      });
    }
  },
});

export const recordCheckout = internalMutation({
  args: {
    checkoutId: v.string(),
    customerId: v.string(),
    productId: v.string(),
    amount: v.number(),
    currency: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("checkouts", {
      ...args,
      status: "succeeded",
      createdAt: Date.now(),
    });
  },
});

export const getUserSubscription = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .first();
  },
});

export const getUserCheckouts = query({
  args: {
    customerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("checkouts")
      .withIndex("by_customer_id", (q) => q.eq("customerId", args.customerId))
      .order("desc")
      .collect();
  },
});