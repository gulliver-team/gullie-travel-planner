import { v } from "convex/values";

export const city = {
  departure_city: v.string(),
  arrival_city: v.string(),
  departure_embedding: v.optional(v.array(v.float64())),
  arrival_embedding: v.optional(v.array(v.float64())),
};
