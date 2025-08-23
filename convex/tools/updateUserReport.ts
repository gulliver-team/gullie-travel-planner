import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import {
  UpdateUserReportInputSchema,
  type UpdateUserReportInput,
} from "../schemas/zod_schemas";

export const updateUserReportStatus = internalMutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args): Promise<void> => {
    // Validate input using Zod schema
    const validatedInput: UpdateUserReportInput =
      UpdateUserReportInputSchema.parse(args);

    const { email } = validatedInput;

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
