import { v } from "convex/values";

export const document = {
  userId: v.optional(v.id("users")),
  userName: v.optional(v.string()),
  email: v.string(),
  phone: v.optional(v.string()),
  fromCity: v.optional(v.string()),
  toCity: v.optional(v.string()),
  selectedOption: v.optional(v.string()),
  pdfUrl: v.optional(v.string()),
  pdfStorageId: v.optional(v.id("_storage")),
  fileName: v.optional(v.string()),
  type: v.optional(v.string()),
  uploadedAt: v.optional(v.number()),
  searchResults: v.optional(v.object({
    cheapest: v.optional(v.any()),
    fastest: v.optional(v.any()),
    convenient: v.optional(v.any()),
    premium: v.optional(v.any()),
  })),
  metadata: v.optional(v.object({
    generatedAt: v.number(),
    sentAt: v.optional(v.number()),
    polarCustomerId: v.optional(v.string()),
    subscriptionStatus: v.optional(v.string()),
  })),
};