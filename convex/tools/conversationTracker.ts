import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";

// Track conversation updates from Vapi
export const trackConversation = internalAction({
  args: {
    callId: v.string(),
    sessionId: v.optional(v.string()),
    message: v.object({
      type: v.string(),
      role: v.optional(v.union(v.literal("assistant"), v.literal("user"), v.literal("system"), v.literal("tool"))),
      content: v.optional(v.string()),
      transcript: v.optional(v.string()),
      timestamp: v.optional(v.number()),
      toolCall: v.optional(v.object({
        name: v.string(),
        arguments: v.any(),
        result: v.optional(v.any()),
      })),
    }),
    call: v.optional(v.object({
      id: v.string(),
      phoneNumber: v.optional(v.string()),
      customer: v.optional(v.object({
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        phoneNumber: v.optional(v.string()),
      })),
    })),
  },
  handler: async (ctx, args) => {
    const { callId, sessionId, message, call } = args;
    
    // Create or update conversation
    await ctx.runMutation(internal.conversations.upsertConversation, {
      callId,
      sessionId,
      userEmail: call?.customer?.email,
      phoneNumber: call?.customer?.phoneNumber || call?.phoneNumber,
    });

    // Add message to transcript if it's a conversation message
    if (message.type === "transcript" || message.type === "conversation-update") {
      const role = message.role || (message.transcript?.startsWith("User:") ? "user" : "assistant");
      const content = message.content || message.transcript || "";
      
      if (content) {
        await ctx.runMutation(internal.conversations.addTranscriptMessage, {
          callId,
          message: {
            role: role as "assistant" | "user" | "system" | "tool",
            content,
            timestamp: message.timestamp || Date.now(),
            toolCall: message.toolCall,
          },
        });
      }
    }

    // Track tool calls
    if (message.type === "tool-calls" && message.toolCall) {
      await ctx.runMutation(internal.conversations.recordToolCall, {
        callId,
        toolCall: {
          name: message.toolCall.name,
          timestamp: Date.now(),
          success: true,
        },
      });
    }

    // Mark conversation as completed
    if (message.type === "end-of-call-report" || message.type === "hang") {
      await ctx.runMutation(internal.conversations.completeConversation, {
        callId,
      });
    }
  },
});

// Extract and persist data from conversations
export const extractConversationData = internalAction({
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
    await ctx.runMutation(internal.conversations.updateExtractedData, {
      callId: args.callId,
      extractedData: args.extractedData,
    });
  },
});

// Get conversation context for Vapi to use
export const getConversationContext = internalAction({
  args: {
    sessionId: v.optional(v.string()),
    callId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<{
    transcript: any[];
    extractedData: any;
    conversationCount: number;
  }> => {
    if (args.sessionId) {
      // Get context from session
      const context = await ctx.runQuery(internal.conversations.getSessionContext, {
        sessionId: args.sessionId,
        limit: args.limit,
      });
      return context;
    } else if (args.callId) {
      // Get specific conversation
      const conversation = await ctx.runQuery(internal.conversations.getConversationByCallId, {
        callId: args.callId,
      });
      if (conversation) {
        return {
          transcript: conversation.transcript,
          extractedData: conversation.extractedData,
          conversationCount: 1,
        };
      }
    }
    
    return {
      transcript: [],
      extractedData: {},
      conversationCount: 0,
    };
  },
});