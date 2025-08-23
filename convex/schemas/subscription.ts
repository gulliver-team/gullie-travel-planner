import { v } from "convex/values";

export const subscriptionSchema = {
  polarId: v.string(),
  userId: v.string(),
  productId: v.string(),
  status: v.string(), // active, canceled, past_due, etc.
  currentPeriodStart: v.optional(v.string()),
  currentPeriodEnd: v.optional(v.string()),
  cancelAtPeriodEnd: v.boolean(),
  metadata: v.any(),
  createdAt: v.number(),
  updatedAt: v.number(),
};

export const checkoutSchema = {
  checkoutId: v.string(),
  customerId: v.string(),
  productId: v.string(),
  amount: v.number(),
  currency: v.string(),
  status: v.string(),
  metadata: v.any(),
  createdAt: v.number(),
};