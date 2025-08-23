import { v } from "convex/values";

export const user = {
  name: v.string(),
  // when we ask user's name we might not know where they are coming from yet
  nationality: v.optional(v.string()),
};
