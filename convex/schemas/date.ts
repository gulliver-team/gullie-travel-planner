import { v } from "convex/values";

export const date = {
  user: v.id("users"),
  city: v.id("cities"),
  departure_date: v.string(),
  arrival_date: v.string(),
};
