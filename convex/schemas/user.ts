import { v } from "convex/values";

export const user = {
  name: v.string(),
  // when we ask user's name we might not know where they are coming from yet
  nationality: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  lastContactedAt: v.optional(v.number()),
  lastReportSentAt: v.optional(v.number()),
  createdAt: v.optional(v.number()),
};
