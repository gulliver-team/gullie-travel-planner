import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const updateUserReportStatus = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const { email } = args;
    
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (user) {
      await ctx.db.patch(user._id, {
        lastReportSentAt: Date.now(),
      });
    }
  },
});