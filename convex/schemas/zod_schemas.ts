import { z } from "zod";

// Base cost schema
export const CostSchema = z.object({
  amount: z.number().positive("Cost must be a positive number"),
  currency: z.string().min(3, "Currency code must be at least 3 characters"),
  notes: z.string().optional(),
});

// Flight cost schema
export const FlightCostSchema = z.object({
  base_fare: CostSchema,
  taxes: CostSchema.optional(),
  fees: CostSchema.optional(),
  total_cost: CostSchema,
  airline: z.string().optional(),
  class: z.enum(["economy", "premium_economy", "business", "first"]).optional(),
  baggage_included: z.boolean().optional(),
});

// Housing cost schema
export const HousingCostSchema = z.object({
  monthly_rent: CostSchema.optional(),
  security_deposit: CostSchema.optional(),
  utilities: CostSchema.optional(),
  total_monthly_cost: CostSchema,
  property_type: z.enum(["apartment", "house", "condo", "studio"]).optional(),
  bedrooms: z.number().int().min(0).optional(),
  area_sqft: z.number().positive().optional(),
  neighborhood: z.string().optional(),
});

// Furniture moving cost schema
export const MovingCostSchema = z.object({
  packing_materials: CostSchema.optional(),
  moving_company: CostSchema.optional(),
  insurance: CostSchema.optional(),
  storage: CostSchema.optional(),
  total_cost: CostSchema,
  estimated_volume: z.string().optional(), // e.g., "2-bedroom apartment"
  distance_km: z.number().positive().optional(),
  delivery_time: z.number().positive().optional(), // in days
});

// Individual simulation result schema
export const SimulationResultSchema = z.object({
  days: z.number().int().positive(),
  flight_cost: FlightCostSchema,
  housing_cost: HousingCostSchema,
  furniture_moving_cost: MovingCostSchema,
  total_cost: CostSchema,
  season: z.enum(["high", "shoulder", "low"]),
  availability: z.enum(["limited", "moderate", "high"]),
  notes: z.string(),
  risk_factors: z.array(z.string()).optional(),
  recommendations: z.array(z.string()).optional(),
});

// LLM response schema
export const LLMResponseSchema = z.object({
  simulations: z.array(SimulationResultSchema).length(3), // Exactly 3 simulations for 30, 90, 180 days
  general_recommendations: z.array(z.string()).min(3).max(10),
  market_insights: z.object({
    current_trends: z.array(z.string()),
    seasonal_factors: z.array(z.string()),
    currency_considerations: z.array(z.string()),
  }),
  visa_requirements: z
    .object({
      required: z.boolean(),
      processing_time_days: z.number().int().positive().optional(),
      cost: CostSchema.optional(),
      documents_needed: z.array(z.string()).optional(),
    })
    .optional(),
  additional_costs: z
    .object({
      health_insurance: CostSchema.optional(),
      local_transportation: CostSchema.optional(),
      food_and_living: CostSchema.optional(),
      entertainment: CostSchema.optional(),
    })
    .optional(),
});

// Input validation schema
export const TravelInputSchema = z.object({
  departure_city: z
    .string()
    .min(2, "Departure city must be at least 2 characters"),
  departure_country: z
    .string()
    .min(2, "Departure country must be at least 2 characters"),
  arrival_city: z.string().min(2, "Arrival city must be at least 2 characters"),
  arrival_country: z
    .string()
    .min(2, "Arrival country must be at least 2 characters"),
  travel_dates: z
    .object({
      earliest_departure: z.string().datetime().optional(),
      latest_arrival: z.string().datetime().optional(),
      flexible_dates: z.boolean().default(true),
    })
    .optional(),
  budget_constraints: z
    .object({
      max_total_cost: CostSchema.optional(),
      preferred_currency: z.string().min(3).optional(),
      cost_priority: z
        .enum(["lowest", "balanced", "premium"])
        .default("balanced"),
    })
    .optional(),
  special_requirements: z
    .object({
      pets: z.boolean().default(false),
      children: z.boolean().default(false),
      elderly_accessibility: z.boolean().default(false),
      business_travel: z.boolean().default(false),
    })
    .optional(),
});

// Prompt template schema for consistent LLM prompting
export const PromptTemplateSchema = z.object({
  system_role: z.string(),
  user_prompt: z.string(),
  expected_format: z.string(),
  constraints: z.array(z.string()),
  examples: z.array(z.record(z.string(), z.string())).optional(),
});

// Export types
export type Cost = z.infer<typeof CostSchema>;
export type FlightCost = z.infer<typeof FlightCostSchema>;
export type HousingCost = z.infer<typeof HousingCostSchema>;
export type MovingCost = z.infer<typeof MovingCostSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export type LLMResponse = z.infer<typeof LLMResponseSchema>;
export type TravelInput = z.infer<typeof TravelInputSchema>;
export type PromptTemplate = z.infer<typeof PromptTemplateSchema>;

// Predefined prompt templates
export const PROMPT_TEMPLATES = {
  travel_planning: {
    system_role: `You are a global mobility expert specializing in international relocation cost analysis. You have extensive knowledge of:
- Flight pricing and airline industry trends
- Global real estate markets and rental costs
- International moving and logistics
- Visa requirements and immigration processes
- Currency exchange and financial planning
- Cultural and practical relocation considerations

You provide accurate, detailed cost estimates and actionable recommendations based on current market conditions.`,

    user_prompt: `Analyze the relocation costs for moving from {departure_city}, {departure_country} to {arrival_city}, {arrival_country}.

Provide detailed cost simulations for three time periods:
1. 30 days from today (high season, limited availability)
2. 90 days from today (shoulder season, moderate availability)  
3. 180 days from today (low season, high availability)

For each time period, provide:
- Flight costs (base fare, taxes, fees, total)
- Housing costs (rent, deposit, utilities, total monthly)
- Moving costs (packing, moving company, insurance, storage, total)
- Total cost breakdown
- Season classification and availability assessment
- Risk factors and specific recommendations

Also provide:
- General relocation recommendations
- Current market insights and trends
- Seasonal factors affecting costs
- Currency considerations
- Visa requirements if applicable
- Additional living costs (health insurance, transportation, food, entertainment)

Format your response as structured JSON matching the expected schema.`,

    expected_format: `Respond with valid JSON matching this structure:
{
  "simulations": [
    {
      "days": 30,
      "flight_cost": { "base_fare": {...}, "total_cost": {...} },
      "housing_cost": { "monthly_rent": {...}, "total_monthly_cost": {...} },
      "furniture_moving_cost": { "moving_company": {...}, "total_cost": {...} },
      "total_cost": {...},
      "season": "high",
      "availability": "limited",
      "notes": "...",
      "risk_factors": ["..."],
      "recommendations": ["..."]
    }
  ],
  "general_recommendations": ["..."],
  "market_insights": { "current_trends": ["..."], "seasonal_factors": ["..."], "currency_considerations": ["..."] },
  "visa_requirements": {...},
  "additional_costs": {...}
}`,

    constraints: [
      "All monetary values must be positive numbers",
      "Use realistic, market-based cost estimates",
      "Consider seasonal variations and market conditions",
      "Provide specific, actionable recommendations",
      "Include risk factors and mitigation strategies",
      "Consider currency exchange rate fluctuations",
      "Factor in local market conditions and regulations",
    ],
  },
} as const;

// Validation helper functions
export function validateLLMResponse(response: unknown): LLMResponse {
  return LLMResponseSchema.parse(response);
}

export function validateTravelInput(input: unknown): TravelInput {
  return TravelInputSchema.parse(input);
}

export function createStructuredPrompt(input: TravelInput): string {
  const template = PROMPT_TEMPLATES.travel_planning;

  return template.user_prompt
    .replace("{departure_city}", input.departure_city)
    .replace("{departure_country}", input.departure_country)
    .replace("{arrival_city}", input.arrival_city)
    .replace("{arrival_country}", input.arrival_country);
}

export function createSystemPrompt(): string {
  return PROMPT_TEMPLATES.travel_planning.system_role;
}

export function createFormatInstructions(): string {
  const template = PROMPT_TEMPLATES.travel_planning;
  return `Expected Format:\n${
    template.expected_format
  }\n\nConstraints:\n${template.constraints.map((c) => `- ${c}`).join("\n")}`;
}
