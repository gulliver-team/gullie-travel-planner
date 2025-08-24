import { v } from "convex/values";

export const exaJob = {
  status: v.union(
    v.literal("pending"),
    v.literal("running"),
    v.literal("completed"),
    v.literal("error")
  ),
  params: v.object({
    originCity: v.string(),
    originCountry: v.optional(v.string()),
    destinationCity: v.string(),
    destinationCountry: v.optional(v.string()),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    moveMonth: v.optional(v.string()),
    context: v.optional(v.string()),
    scenario: v.union(
      v.literal("cheapest"),
      v.literal("fastest"),
      v.literal("balanced"),
      v.literal("luxury"),
    ),
  }),
  // results: { [category]: Array<{ title, url, text?, snippet?, publishedDate?, score?, author? }> }
  results: v.optional(
    v.record(
      v.string(),
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          text: v.optional(v.string()),
          snippet: v.optional(v.string()),
          publishedDate: v.optional(v.string()),
          score: v.optional(v.number()),
          author: v.optional(v.string()),
        })
      )
    )
  ),
  errors: v.optional(v.record(v.string(), v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
};

