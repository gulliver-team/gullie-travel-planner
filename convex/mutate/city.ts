import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const _createCity = mutation({
  args: {
    departure_city: v.string(),
    departure_country: v.optional(v.string()),
    arrival_city: v.string(),
    arrival_country: v.optional(v.string()),
    user: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cities", {
      user: args.user,
      departure_city: args.departure_city,
      departure_country: args.departure_country,
      arrival_city: args.arrival_city,
      arrival_country: args.arrival_country,
    });
  },
});
