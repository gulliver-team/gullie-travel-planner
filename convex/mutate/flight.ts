import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const _createFlight = mutation({
  args: {
    flight_cost: v.number(),
    currency: v.string(),
    user: v.id("users"),
    date: v.id("dates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flights", {
      flight_cost: args.flight_cost,
      currency: args.currency,
      user: args.user,
      date: args.date,
    });
  },
});
