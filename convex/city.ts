import { v } from "convex/values";
import { action, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { xai } from "@ai-sdk/xai";
import { generateText } from "ai";

// Types for our simulation results
interface SimulationResult {
  days: number;
  flight_cost: number;
  housing_cost: number;
  furniture_moving_cost: number;
  currency: string;
  notes: string;
}

interface LLMResponse {
  simulations: SimulationResult[];
  recommendations: string[];
}

interface SearchResult {
  success: boolean;
  cityId: string;
  dateIds: string[];
  simulations: any[];
  recommendations: string[];
}

// Helper mutations
export const _createCityRecord = mutation({
  args: {
    departure_city: v.string(),
    departure_country: v.optional(v.string()),
    arrival_city: v.string(),
    arrival_country: v.optional(v.string()),
    user: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("cities", {
      user: args.user,
      departure_city: args.departure_city,
      departure_country: args.departure_country,
      arrival_city: args.arrival_city,
      arrival_country: args.arrival_country,
    });
  },
});

export const _createDateRecord = mutation({
  args: {
    user: v.id("users"),
    city: v.id("cities"),
    departure_date: v.string(),
    arrival_date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("dates", {
      user: args.user,
      city: args.city,
      departure_date: args.departure_date,
      arrival_date: args.arrival_date,
    });
  },
});

export const _createFlightRecord = mutation({
  args: {
    flight_cost: v.number(),
    currency: v.string(),
    user: v.id("users"),
    date: v.id("dates"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("flights", {
      flight_cost: args.flight_cost,
      currency: args.currency,
      user: args.user,
      date: args.date,
    });
  },
});

export const _createRentalRecord = mutation({
  args: {
    rental_cost: v.string(),
    user: v.id("users"),
    city: v.id("cities"),
    area: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("rentals", {
      rental_cost: args.rental_cost,
      user: args.user,
      city: args.city,
      area: args.area,
    });
  },
});

export const searchCosts = action({
  args: {
    user: v.id("users"),
    departure_city: v.string(),
    arrival_city: v.string(),
    departure_country: v.optional(v.string()),
    arrival_country: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<SearchResult> => {
    // Step 1: Tokenize and validate input
    const tokenizedInput = await tokenizeInput(args);

    // Step 2: Create city record
    const cityId: string = await ctx.runMutation((internal as any).city._createCityRecord, {
      departure_city: args.departure_city,
      departure_country: args.departure_country,
      arrival_city: args.arrival_city,
      arrival_country: args.arrival_country,
      user: args.user,
    });

    // Step 3: Create date records for 30, 90, and 180 days
    const dateIds: string[] = await Promise.all([
      createDateRecord(ctx, args.user, cityId, 30),
      createDateRecord(ctx, args.user, cityId, 90),
      createDateRecord(ctx, args.user, cityId, 180),
    ]);

    // Step 4: Call LLM for simulations
    const llmResponse = await callExaToSearch(tokenizedInput);

    // Step 5: Store simulation results (mock for now)
    const mockLlmResponse: LLMResponse = {
      simulations: [
        { days: 30, flight_cost: 500, housing_cost: 1000, furniture_moving_cost: 300, currency: 'USD', notes: 'Mock 30-day simulation' },
        { days: 90, flight_cost: 600, housing_cost: 2500, furniture_moving_cost: 800, currency: 'USD', notes: 'Mock 90-day simulation' },
        { days: 180, flight_cost: 700, housing_cost: 5000, furniture_moving_cost: 1200, currency: 'USD', notes: 'Mock 180-day simulation' }
      ],
      recommendations: ['Consider booking in advance', 'Look for furnished options', 'Compare multiple moving companies']
    };
    
    const results = await storeSimulationResults(
      ctx,
      args.user,
      cityId,
      dateIds,
      mockLlmResponse
    );

    return {
      success: true,
      cityId,
      dateIds,
      simulations: results,
      recommendations: mockLlmResponse.recommendations,
    };
  },
});

// Tokenize input for LLM processing
async function tokenizeInput(args: {
  departure_city: string;
  arrival_city: string;
  departure_country?: string;
  arrival_country?: string;
}) {
  // Normalize and clean input
  const normalized = {
    departure: {
      city: args.departure_city.trim().toLowerCase(),
      country: args.departure_country?.trim().toLowerCase() || "unknown",
    },
    arrival: {
      city: args.arrival_city.trim().toLowerCase(),
      country: args.arrival_country?.trim().toLowerCase() || "unknown",
    },
  };

  // Validate city names (basic validation)
  if (!normalized.departure.city || !normalized.arrival.city) {
    throw new Error("City names are required");
  }

  // Create structured prompt for LLM
  const tokenizedPrompt = {
    route: `${normalized.departure.city}, ${normalized.departure.country} → ${normalized.arrival.city}, ${normalized.arrival.country}`,
    departure: normalized.departure,
    arrival: normalized.arrival,
    simulation_periods: [30, 90, 180],
    categories: ["flight", "housing", "furniture_moving"],
  };

  return tokenizedPrompt;
}

// Create date record for a specific number of days from now
async function createDateRecord(
  ctx: any,
  userId: string,
  cityId: string,
  daysFromNow: number
): Promise<string> {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysFromNow);

  const departureDate = new Date();
  departureDate.setDate(departureDate.getDate() + daysFromNow);

  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + daysFromNow + 1); // Assume 1 day travel

  return await ctx.runMutation((internal as any).city._createDateRecord, {
    user: userId,
    city: cityId,
    departure_date: departureDate.toISOString().split("T")[0],
    arrival_date: arrivalDate.toISOString().split("T")[0],
  });
}

// Call LLM for simulations
async function callExaToSearch(tokenizedInput: any) {
  // Promise<LLMResponse>
  // This would be your actual LLM API call
  // For now, returning mock data structure
  const prompt = `As a global mobility expert, provide cost simulations for the following route: ${tokenizedInput.route}

Please provide detailed cost estimates for:
1. Flight tickets
2. Housing costs (rental/mortgage)
3. Furniture moving costs

For each time period: 30 days, 90 days, and 180 days from today.

Consider factors like:
- Seasonal pricing variations
- Distance and route complexity
- Local market conditions
- Currency exchange rates
- Moving company availability

Format your response as structured data with specific cost estimates and recommendations. There should be a list of JSON objects, each with the following fields:
- days: number
- flight_cost: number
- housing_cost: number
- furniture_moving_cost: number
- currency: string
- notes: string

There are four types of options should be considered, the cheapest, the most expensive, the most flexible, and the most expensive and flexible.`;
}

// Store simulation results in the database
async function storeSimulationResults(
  ctx: any,
  userId: string,
  cityId: string,
  dateIds: string[],
  llmResponse: LLMResponse
): Promise<any[]> {
  const results = [];

  for (let i = 0; i < dateIds.length; i++) {
    const dateId = dateIds[i];
    const simulation = llmResponse.simulations[i];

    // Store flight information
    const flightId = await ctx.runMutation((internal as any).city._createFlightRecord, {
      flight_cost: simulation.flight_cost,
      currency: simulation.currency,
      user: userId,
      date: dateId,
    });

    // Store rental/housing information
    const rentalId = await ctx.runMutation((internal as any).city._createRentalRecord, {
      rental_cost: simulation.housing_cost.toString(),
      user: userId,
      city: cityId, // Fixed: reference the city, not date
    });

    results.push({
      dateId,
      flightId,
      rentalId,
      simulation,
    });
  }

  return results;
}

async function search_visa_based_on_country(
  ctx: any,
  departure_country: string,
  arrival_country: string
) {
  const prompt = `As a global mobility expert, if i am a citizen of ${departure_country} and i want to move to ${arrival_country}, what are the visa requirements?`;

  const response = await generateText({
    model: xai("gemini-2.0-flash-001"),
    prompt,
  });

  return response.text;
}
