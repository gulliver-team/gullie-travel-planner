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
});
