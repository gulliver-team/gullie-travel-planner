import { query } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";

export const get = query({
  args: {
    user: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("name"), args.user))
      .first();

    if (!user) {
      return "We can't find your name, can you tell me your name again?";
    }
    return await ctx.db
      .query("cities")
      .filter((q) => q.eq(q.field("user"), user._id))
      .collect();
  },
});
