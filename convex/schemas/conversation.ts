import { v } from "convex/values";

export const conversation = {
  // Vapi call ID
  callId: v.string(),
  
  // Session ID for grouping related conversations
  sessionId: v.optional(v.string()),
  
  // User information
  userId: v.optional(v.id("users")),
  userEmail: v.optional(v.string()),
  phoneNumber: v.optional(v.string()),
  
  // Conversation transcript
  transcript: v.array(v.object({
    role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system"), v.literal("tool")),
    content: v.string(),
    timestamp: v.number(),
    toolCall: v.optional(v.object({
      name: v.string(),
      arguments: v.any(),
      result: v.optional(v.any()),
    })),
  })),
  
  // Vector embeddings for semantic search
  embedding: v.optional(v.array(v.float64())),
  
  // Conversation metadata
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  duration: v.optional(v.number()),
  
  // Extracted context
  extractedData: v.optional(v.object({
    originCity: v.optional(v.string()),
    originCountry: v.optional(v.string()),
    destinationCity: v.optional(v.string()),
    destinationCountry: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    visaOptions: v.optional(v.string()),
    budget: v.optional(v.string()),
    travelDates: v.optional(v.string()),
  })),
  
  // Tool calls summary
  toolCalls: v.array(v.object({
    name: v.string(),
    timestamp: v.number(),
    success: v.boolean(),
  })),
  
  // Status
  status: v.union(
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("failed"),
    v.literal("abandoned")
  ),
};