import { v } from "convex/values";
import { mutation, query, internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Create or update a conversation
export const upsertConversation = internalMutation({
  args: {
    callId: v.string(),
    sessionId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    userEmail: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    transcript: v.optional(v.array(v.object({
      role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system"), v.literal("tool")),
      content: v.string(),
      timestamp: v.number(),
      toolCall: v.optional(v.object({
        name: v.string(),
        arguments: v.any(),
        result: v.optional(v.any()),
      })),
    }))),
    status: v.optional(v.union(
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("abandoned")
    )),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();

    if (existing) {
      // Update existing conversation
      await ctx.db.patch(existing._id, {
        ...(args.sessionId !== undefined && { sessionId: args.sessionId }),
        ...(args.userId !== undefined && { userId: args.userId }),
        ...(args.userEmail !== undefined && { userEmail: args.userEmail }),
        ...(args.phoneNumber !== undefined && { phoneNumber: args.phoneNumber }),
        ...(args.transcript !== undefined && { transcript: args.transcript }),
        ...(args.status !== undefined && { status: args.status }),
      });
      return existing._id;
    } else {
      // Create new conversation
      const conversationId = await ctx.db.insert("conversations", {
        callId: args.callId,
        sessionId: args.sessionId,
        userId: args.userId,
        userEmail: args.userEmail,
        phoneNumber: args.phoneNumber,
        transcript: args.transcript || [],
        startedAt: Date.now(),
        status: args.status || "in_progress",
        toolCalls: [],
        extractedData: {},
      });
      return conversationId;
    }
  },
});

// Add a message to the conversation transcript
export const addTranscriptMessage = internalMutation({
  args: {
    callId: v.string(),
    message: v.object({
      role: v.union(v.literal("assistant"), v.literal("user"), v.literal("system"), v.literal("tool")),
      content: v.string(),
      timestamp: v.number(),
      toolCall: v.optional(v.object({
        name: v.string(),
        arguments: v.any(),
        result: v.optional(v.any()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();

    if (!conversation) {
      // Create new conversation if it doesn't exist
      await ctx.db.insert("conversations", {
        callId: args.callId,
        transcript: [args.message],
        startedAt: Date.now(),
        status: "in_progress",
        toolCalls: [],
      });
    } else {
      // Append message to existing transcript
      const updatedTranscript = [...conversation.transcript, args.message];
      await ctx.db.patch(conversation._id, {
        transcript: updatedTranscript,
      });
    }
  },
});

// Update extracted data from conversation
export const updateExtractedData = internalMutation({
  args: {
    callId: v.string(),
    extractedData: v.object({
      originCity: v.optional(v.string()),
      originCountry: v.optional(v.string()),
      destinationCity: v.optional(v.string()),
      destinationCountry: v.optional(v.string()),
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      visaOptions: v.optional(v.string()),
      budget: v.optional(v.string()),
      travelDates: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();

    if (conversation) {
      const mergedData = {
        ...conversation.extractedData,
        ...args.extractedData,
      };
      await ctx.db.patch(conversation._id, {
        extractedData: mergedData,
      });
    }
  },
});

// Record a tool call
export const recordToolCall = internalMutation({
  args: {
    callId: v.string(),
    toolCall: v.object({
      name: v.string(),
      timestamp: v.number(),
      success: v.boolean(),
    }),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();

    if (conversation) {
      const updatedToolCalls = [...conversation.toolCalls, args.toolCall];
      await ctx.db.patch(conversation._id, {
        toolCalls: updatedToolCalls,
      });
    }
  },
});

// Get conversation by call ID
export const getConversationByCallId = internalQuery({
  args: { callId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();
  },
});

// Get recent conversations by session ID
export const getRecentConversationsBySession = query({
  args: { 
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    return await ctx.db
      .query("conversations")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);
  },
});

// Get conversation context for a session
export const getSessionContext = internalQuery({
  args: { 
    sessionId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);

    // Combine transcripts and extracted data
    const combinedTranscript = conversations.flatMap(c => c.transcript);
    const extractedData = conversations.reduce((acc, c) => ({
      ...acc,
      ...c.extractedData,
    }), {});

    return {
      transcript: combinedTranscript,
      extractedData,
      conversationCount: conversations.length,
    };
  },
});

// Search conversations by content
export const searchConversations = query({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // This is a simple text search. For better results, you could:
    // 1. Use vector embeddings for semantic search
    // 2. Implement full-text search
    const allConversations = await ctx.db
      .query("conversations")
      .order("desc")
      .take(100);

    const filtered = allConversations.filter(conv => {
      const transcriptText = conv.transcript
        .map(msg => msg.content)
        .join(" ")
        .toLowerCase();
      return transcriptText.includes(args.query.toLowerCase());
    });

    return filtered.slice(0, limit);
  },
});

// Mark conversation as completed
export const completeConversation = internalMutation({
  args: {
    callId: v.string(),
    duration: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();

    if (conversation) {
      await ctx.db.patch(conversation._id, {
        status: "completed",
        endedAt: Date.now(),
        ...(args.duration !== undefined && { duration: args.duration }),
      });
    }
  },
});