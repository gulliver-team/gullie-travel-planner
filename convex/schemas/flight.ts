import { v } from "convex/values";

export const flight = {
  flight_cost: v.number(),
  currency: v.string(),
  user: v.id("users"),
  date: v.id("dates"),
};
