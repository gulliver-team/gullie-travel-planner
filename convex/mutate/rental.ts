import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const _createRental = mutation({
  args: {
    rental_cost: v.string(),
    user: v.id("users"),
    city: v.id("cities"),
    area: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rentals", {
      rental_cost: args.rental_cost,
      user: args.user,
      city: args.city,
      area: args.area,
    });
  },
});
