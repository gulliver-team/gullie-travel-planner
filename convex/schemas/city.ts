import { v } from "convex/values";

export const city = {
  date: v.optional(v.id("dates")),
  user: v.optional(v.id("users")),
  departure_city: v.string(),
  departure_country: v.optional(v.string()),
  arrival_city: v.string(),
  arrival_country: v.optional(v.string()),
  results: v.optional(v.string()),
};
