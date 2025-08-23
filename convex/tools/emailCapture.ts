import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import {
  EmailCaptureInputSchema,
  EmailCaptureOutputSchema,
  type EmailCaptureInput,
  type EmailCaptureOutput,
} from "../schemas/zod_schemas";

export const captureContactInfo = internalMutation({
  args: {
    email: v.string(),
    phone: v.optional(v.string()),
    name: v.string(),
  },
  handler: async (ctx, args): Promise<EmailCaptureOutput> => {
    // Validate input using Zod schema
    const validatedInput: EmailCaptureInput =
      EmailCaptureInputSchema.parse(args);

    const { email, phone, name } = validatedInput;

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    if (existingUser) {
      // Update existing user
      await ctx.db.patch(existingUser._id, {
        phone: phone || existingUser.phone,
        name: name || existingUser.name,
        lastContactedAt: Date.now(),
      });
    } else {
      // Create new user
      await ctx.db.insert("users", {
        email,
        phone,
        name,
        createdAt: Date.now(),
        lastContactedAt: Date.now(),
      });
    }

    return {
      success: true,
      message: "Contact information saved successfully",
    };
  },
});
