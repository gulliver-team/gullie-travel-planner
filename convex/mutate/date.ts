import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const _createDate = mutation({
  args: {
    user: v.id("users"),
    city: v.id("cities"),
    departure_date: v.string(),
    arrival_date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dates", {
      user: args.user,
      city: args.city,
      departure_date: args.departure_date,
      arrival_date: args.arrival_date,
    });
  },
});
