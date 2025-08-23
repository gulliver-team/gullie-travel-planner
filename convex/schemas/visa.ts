import { v } from "convex/values";

export const visa = {
  visa_type: v.string(),
  visa_cost: v.optional(v.string()),
  user: v.id("users"),
  date: v.id("dates"),
};
