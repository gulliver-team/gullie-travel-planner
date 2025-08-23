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

// Tool-specific schemas for convex/tools/

// City Search Tool Schemas
export const CitySearchInputSchema = z.object({
  originCity: z.string().min(2, "Origin city must be at least 2 characters"),
  originCountry: z
    .string()
    .min(2, "Origin country must be at least 2 characters"),
  destinationCity: z
    .string()
    .min(2, "Destination city must be at least 2 characters"),
  destinationCountry: z
    .string()
    .min(2, "Destination country must be at least 2 characters"),
});

export const VisaOptionSchema = z.object({
  type: z.enum(["cheapest", "fastest", "convenient", "premium"]),
  visa: z.string(),
  cost: z.string(),
  timeline: z.string(),
  description: z.string(),
  details: z.object({
    visa_cost: z.string(),
    flight: z.string(),
    housing: z.string(),
    moving: z.string(),
  }),
});

export const CitySearchOutputSchema = z.object({
  cheapest: VisaOptionSchema,
  fastest: VisaOptionSchema,
  convenient: VisaOptionSchema,
  premium: VisaOptionSchema,
});

export const EmailConfirmationInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required"),
  searchData: z.string(),
  originCity: z.string(),
  originCountry: z.string(),
  destinationCity: z.string(),
  destinationCountry: z.string(),
  storageId: z.optional(z.any()), // Using any for Convex ID compatibility
});

// Cost Estimation Tool Schemas
export const CostEstimationInputSchema = z.object({
  destinationCity: z
    .string()
    .min(2, "Destination city must be at least 2 characters"),
  includeFlight: z.boolean(),
  includeHousing: z.boolean(),
  includeMoving: z.boolean(),
  familySize: z
    .number()
    .int()
    .positive("Family size must be a positive integer"),
});

export const BaseCostsSchema = z.object({
  flight: z.object({
    economy: z.number().positive(),
    premium: z.number().positive(),
    business: z.number().positive(),
  }),
  housing: z.object({
    shared: z.number().positive(),
    one_bed: z.number().positive(),
    two_bed: z.number().positive(),
    family: z.number().positive(),
  }),
  moving: z.object({
    minimal: z.number().positive(),
    standard: z.number().positive(),
    full: z.number().positive(),
    premium: z.number().positive(),
  }),
  setup: z.object({
    utilities: z.number().positive(),
    deposits: z.number().positive(),
    initial_groceries: z.number().positive(),
    transport_setup: z.number().positive(),
    phone_internet: z.number().positive(),
  }),
});

export const CostBreakdownSchema = z.object({
  totalMin: z.number().positive(),
  totalMax: z.number().positive(),
  breakdown: z.array(z.string()),
  contingency: z.number().positive(),
});

// PDF Sender Tool Schemas
export const ConsultationDataSchema = z.object({
  name: z.string(),
  originCity: z.string(),
  originCountry: z.string(),
  destinationCity: z.string(),
  destinationCountry: z.string(),
  visaOptions: z.string(),
  timestamp: z.string().datetime(),
});

export const PDFSenderInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  consultationData: ConsultationDataSchema,
  storageId: z.optional(z.string()),
});

export const PDFSenderOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  emailId: z.string().optional(),
});

// Email Capture Tool Schemas
export const EmailCaptureInputSchema = z.object({
  email: z.string().email("Invalid email format"),
  phone: z.optional(z.string()),
  name: z.string().min(1, "Name is required"),
});

export const EmailCaptureOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Update User Report Tool Schemas
export const UpdateUserReportInputSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Document Details Tool Schemas
export const DocumentDetailsInputSchema = z.object({
  documentType: z.string().min(1, "Document type is required"),
  country: z.string().min(2, "Country must be at least 2 characters"),
});

export const DocumentGuideSchema = z.object({
  purpose: z.string(),
  where: z.optional(z.string()),
  process: z.optional(z.array(z.string())),
  requirements: z.optional(z.array(z.string())),
  must_include: z.optional(z.array(z.string())),
  minimum_amounts: z.optional(z.record(z.string(), z.string())),
  validity: z.optional(z.string()),
  cost: z.optional(z.string()),
  tests_included: z.optional(z.array(z.string())),
  additional: z.optional(z.string()),
  authentication: z.optional(z.string()),
  tips: z.string(),
});

// Visa Requirements Tool Schemas
export const VisaRequirementsInputSchema = z.object({
  originCountry: z
    .string()
    .min(2, "Origin country must be at least 2 characters"),
  destinationCountry: z
    .string()
    .min(2, "Destination country must be at least 2 characters"),
  visaType: z.optional(z.string()),
});

export const VisaOptionDetailsSchema = z.object({
  age: z.optional(z.string()),
  duration: z.string(),
  work: z.optional(z.string()),
  cost: z.string(),
  processing: z.string(),
  requirement: z.optional(z.string()),
  path_to_residency: z.optional(z.string()),
  investment: z.optional(z.string()),
});

export const VisaRequirementsSchema = z.object({
  documents: z.array(z.string()),
  process: z.array(z.string()),
  timeline: z.string(),
  costs: z.object({
    application: z.string(),
    health_surcharge: z.string(),
    biometric: z.string(),
    priority_service: z.string(),
  }),
});

// Prompt Structure Schemas for LLM Instructions
export const VisaAnalysisRequirementsSchema = z.object({
  visaTypes: z
    .array(z.string())
    .describe("Different visa types available (tourist, work, student, etc.)"),
  costs: z.array(z.string()).describe("Costs for each visa type"),
  processingTimes: z.array(z.string()).describe("Processing times"),
  keyRequirements: z.array(z.string()).describe("Key requirements"),
});

export const RelocationOptionsStructureSchema = z.object({
  cheapest: z.object({
    label: z.string().describe("Cheapest option (budget-conscious)"),
    description: z.string(),
  }),
  fastest: z.object({
    label: z.string().describe("Fastest option (urgent relocation)"),
    description: z.string(),
  }),
  convenient: z.object({
    label: z.string().describe("Most convenient (balanced approach)"),
    description: z.string(),
  }),
  premium: z.object({
    label: z.string().describe("Premium option (comprehensive service)"),
    description: z.string(),
  }),
});

export const CostAnalysisRequirementsSchema = z.object({
  marketRates: z
    .string()
    .describe("Current market rates for the destination city"),
  familySizeImpact: z.string().describe("Family size impact on costs"),
  seasonalVariations: z.string().describe("Seasonal variations"),
  hiddenCosts: z.string().describe("Hidden costs often overlooked"),
  currencyConversions: z
    .string()
    .describe("Currency conversions if applicable"),
});

export const CostEstimationOutputSchema = z.object({
  totalCostRange: z.string().describe("Total cost range (min-max)"),
  detailedBreakdown: z.string().describe("Detailed breakdown by category"),
  moneySavingTips: z
    .string()
    .describe("Money-saving tips specific to this destination"),
  hiddenCosts: z.string().describe("Hidden costs to watch for"),
  bestTiming: z.string().describe("Best timing for relocation to save money"),
});

export const LLMPromptSchema = z.object({
  systemRole: z.string().describe("System role description for the AI model"),
  userPrompt: z.string().describe("User prompt content"),
  expectedFormat: z.string().describe("Expected response format"),
  constraints: z.array(z.string()).describe("Constraints for the response"),
});

export const CitySearchPromptSchema = z.object({
  systemRole: z.object({
    role: z.string().describe("AI role description"),
    citizenshipCheck: z
      .string()
      .describe("Citizenship verification instruction"),
    analysisInstructions: z
      .string()
      .describe("Instructions for analyzing search results"),
    outputFormat: z.string().describe("Expected output format"),
  }),
  userPrompt: z.object({
    context: z.string().describe("Context about the search results"),
    request: z.string().describe("What the user is requesting"),
    structureInstructions: z.string().describe("How to structure the response"),
    outputRequirements: z.string().describe("What to include in the output"),
  }),
});

// Export tool-specific types
export type CitySearchInput = z.infer<typeof CitySearchInputSchema>;
export type CitySearchOutput = z.infer<typeof CitySearchOutputSchema>;
export type VisaOption = z.infer<typeof VisaOptionSchema>;
export type EmailConfirmationInput = z.infer<
  typeof EmailConfirmationInputSchema
>;
export type CostEstimationInput = z.infer<typeof CostEstimationInputSchema>;
export type BaseCosts = z.infer<typeof BaseCostsSchema>;
export type CostBreakdown = z.infer<typeof CostBreakdownSchema>;
export type ConsultationData = z.infer<typeof ConsultationDataSchema>;
export type PDFSenderInput = z.infer<typeof PDFSenderInputSchema>;
export type PDFSenderOutput = z.infer<typeof PDFSenderOutputSchema>;
export type EmailCaptureInput = z.infer<typeof EmailCaptureInputSchema>;
export type EmailCaptureOutput = z.infer<typeof EmailCaptureOutputSchema>;
export type UpdateUserReportInput = z.infer<typeof UpdateUserReportInputSchema>;
export type DocumentDetailsInput = z.infer<typeof DocumentDetailsInputSchema>;
export type DocumentGuide = z.infer<typeof DocumentGuideSchema>;
export type VisaRequirementsInput = z.infer<typeof VisaRequirementsInputSchema>;
export type VisaOptionDetails = z.infer<typeof VisaOptionDetailsSchema>;
export type VisaRequirements = z.infer<typeof VisaRequirementsSchema>;
export type VisaAnalysisRequirements = z.infer<
  typeof VisaAnalysisRequirementsSchema
>;
export type RelocationOptionsStructure = z.infer<
  typeof RelocationOptionsStructureSchema
>;
export type CostAnalysisRequirements = z.infer<
  typeof CostAnalysisRequirementsSchema
>;
export type CostEstimationOutput = z.infer<typeof CostEstimationOutputSchema>;
export type LLMPrompt = z.infer<typeof LLMPromptSchema>;
export type CitySearchPrompt = z.infer<typeof CitySearchPromptSchema>;
