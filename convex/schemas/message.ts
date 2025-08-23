import { v } from "convex/values";

export const message = {
  body: v.string(),
  embedding: v.optional(v.array(v.float64())),
  user: v.id("users"),
};
