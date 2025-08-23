import { v } from "convex/values";

export const rental = {
  area: v.optional(v.string()), // area will be coming from the destination city
  rental_cost: v.optional(v.string()),
  user: v.id("users"),
  city: v.id("cities"),
};
