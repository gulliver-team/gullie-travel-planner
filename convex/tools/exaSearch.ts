import { v } from "convex/values";
import { action } from "../_generated/server";

export const exaSearch = action({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {},
});
