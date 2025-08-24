import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { message } from "./schemas/message";
import { user } from "./schemas/user";
import { city } from "./schemas/city";
import { date } from "./schemas/date";
import { visa } from "./schemas/visa";
import { flight } from "./schemas/flight";
import { rental } from "./schemas/rental";
import { document } from "./schemas/document";
import { subscriptionSchema, checkoutSchema } from "./schemas/subscription";
import { conversation } from "./schemas/conversation";
import { exaJob } from "./schemas/exaJob";

export default defineSchema({
  messages: defineTable(message).vectorIndex("by_embedding", {
    dimensions: 1536,
    vectorField: "embedding",
    filterFields: ["body"],
  }),

  users: defineTable(user),

  // initial prompt - we will have created date to run simulation at here
  cities: defineTable(city),

  // user input dates at here
  dates: defineTable(date),

  visa_options: defineTable(visa),

  // simulation case results - 3 simulation ahead for each moving plan
  flights: defineTable(flight),

  rentals: defineTable(rental),
  
  // Generated PDF documents for users
  documents: defineTable(document)
    .index("by_user", ["userId"])
    .index("by_email", ["email"]),
    
  // Subscription data from Polar
  subscriptions: defineTable(subscriptionSchema)
    .index("by_polar_id", ["polarId"])
    .index("by_user_id", ["userId"])
    .index("by_status", ["status"]),
    
  // Checkout records from Polar
  checkouts: defineTable(checkoutSchema)
    .index("by_checkout_id", ["checkoutId"])
    .index("by_customer_id", ["customerId"]),
    
  // Vapi conversation history
  conversations: defineTable(conversation)
    .index("by_call_id", ["callId"])
    .index("by_session_id", ["sessionId"])
    .index("by_user_id", ["userId"])
    .index("by_email", ["userEmail"])
    .index("by_phone", ["phoneNumber"])
    .index("by_status", ["status"])
    .vectorIndex("by_embedding", {
      dimensions: 1536,
      vectorField: "embedding",
    }),
  
  // Exa live search jobs (stream raw search results to UI)
  exa_jobs: defineTable(exaJob),
});
