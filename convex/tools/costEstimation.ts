import { v } from "convex/values";
import { internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { OpenAI } from "openai";
import Exa from "exa-js";
import {
  CostEstimationInputSchema,
  BaseCostsSchema,
  CostAnalysisRequirementsSchema,
  CostEstimationOutputSchema,
  type CostEstimationInput,
  type BaseCosts,
  type CostAnalysisRequirements,
  type CostEstimationOutput,
} from "../schemas/zod_schemas";

export const estimateRelocationCosts = internalMutation({
  args: {
    destinationCity: v.string(),
    includeFlight: v.boolean(),
    includeHousing: v.boolean(),
    includeMoving: v.boolean(),
    familySize: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Validate input using Zod schema
    const validatedInput: CostEstimationInput =
      CostEstimationInputSchema.parse(args);

    const {
      destinationCity,
      includeFlight,
      includeHousing,
      includeMoving,
      familySize,
    } = validatedInput;

    // Call the OpenAI action for intelligent cost estimation
    const costAnalysis: string = await ctx.scheduler.runAfter(
      0,
      internal.tools.costEstimation.analyzeWithOpenAI,
      {
        destinationCity,
        includeFlight,
        includeHousing,
        includeMoving,
        familySize,
      }
    );

    return costAnalysis;
  },
});

export const analyzeWithOpenAI = internalAction({
  args: {
    destinationCity: v.string(),
    includeFlight: v.boolean(),
    includeHousing: v.boolean(),
    includeMoving: v.boolean(),
    familySize: v.number(),
  },
  handler: async (ctx, args): Promise<string> => {
    // Validate input using Zod schema
    const validatedInput: CostEstimationInput =
      CostEstimationInputSchema.parse(args);

    const {
      destinationCity,
      includeFlight,
      includeHousing,
      includeMoving,
      familySize,
    } = validatedInput;

    const openaiApiKey = process.env.OPENAI_API_KEY;
    const exaApiKey = process.env.EXA_API_KEY;

    if (!openaiApiKey) {
      throw new Error("Missing OpenAI API key");
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Gather real-time data if Exa is available
    let searchResults = "";
    if (exaApiKey) {
      try {
        const exa = new Exa(exaApiKey);
        const costQuery = `${destinationCity} cost of living 2024 2025 apartment rent prices flight costs moving expenses utilities groceries`;

        const search = await exa.searchAndContents(costQuery, {
          numResults: 5,
          text: true,
          startPublishedDate: "2023-01-01",
        });

        searchResults = search.results
          .map((r) => `${r.title}: ${r.text?.substring(0, 500)}`)
          .join("\n\n");
      } catch (error) {
        console.error("Exa search error:", error);
      }
    }

    // Base cost data structure for fallback - validate with Zod
    const baseCosts: BaseCosts = BaseCostsSchema.parse({
      flight: {
        economy: 600 * familySize,
        premium: 1500 * familySize,
        business: 3500 * familySize,
      },
      housing: {
        shared: 800,
        one_bed: 1500,
        two_bed: 2200,
        family: 3500,
      },
      moving: {
        minimal: 500,
        standard: 2500,
        full: 5000,
        premium: 8000,
      },
      setup: {
        utilities: 300,
        deposits: 2500,
        initial_groceries: 500,
        transport_setup: 200,
        phone_internet: 150,
      },
    });

    try {
      // Create structured prompt data using Zod schemas
      const costAnalysisRequirements: CostAnalysisRequirements = {
        marketRates: "1. Current market rates for the destination city",
        familySizeImpact: "2. Family size impact on costs",
        seasonalVariations: "3. Seasonal variations",
        hiddenCosts: "4. Hidden costs often overlooked",
        currencyConversions: "5. Currency conversions if applicable",
      };

      const costEstimationOutput: CostEstimationOutput = {
        totalCostRange: "1. Total cost range (min-max)",
        detailedBreakdown: "2. Detailed breakdown by category",
        moneySavingTips: "3. Money-saving tips specific to this destination",
        hiddenCosts: "4. Hidden costs to watch for",
        bestTiming: "5. Best timing for relocation to save money",
      };

      // Validate the structured data with Zod schemas
      CostAnalysisRequirementsSchema.parse(costAnalysisRequirements);
      CostEstimationOutputSchema.parse(costEstimationOutput);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a relocation cost expert. Analyze the provided data and estimate relocation costs.
            Consider:
            ${costAnalysisRequirements.marketRates}
            ${costAnalysisRequirements.familySizeImpact}
            ${costAnalysisRequirements.seasonalVariations}
            ${costAnalysisRequirements.hiddenCosts}
            ${costAnalysisRequirements.currencyConversions}
            
            Base your estimates on real data when available, otherwise use these baseline costs as reference:
            ${JSON.stringify(baseCosts, null, 2)}
            
            Provide practical, actionable cost breakdowns with ranges.`,
          },
          {
            role: "user",
            content: `Estimate relocation costs to ${destinationCity} for ${familySize} ${familySize === 1 ? "person" : "people"}.
            
            Include costs for:
            - Flights: ${includeFlight ? "Yes" : "No"}
            - Housing: ${includeHousing ? "Yes" : "No"}
            - Moving services: ${includeMoving ? "Yes" : "No"}
            
            ${searchResults ? `Recent market data for ${destinationCity}:\n${searchResults}` : "Use standard estimates for this city."}
            
            Provide:
            ${costEstimationOutput.totalCostRange}
            ${costEstimationOutput.detailedBreakdown}
            ${costEstimationOutput.moneySavingTips}
            ${costEstimationOutput.hiddenCosts}
            ${costEstimationOutput.bestTiming}
            
            Format as a clear, structured response with emojis for categories.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const analysis = completion.choices[0].message.content || "";

      // Parse and structure the response
      if (analysis) {
        return analysis;
      }
    } catch (error) {
      console.error("OpenAI analysis error:", error);
    }

    // Fallback to calculated estimates if OpenAI fails
    let totalMin = 0;
    let totalMax = 0;
    let breakdown = [];

    if (includeFlight) {
      totalMin += baseCosts.flight.economy;
      totalMax += baseCosts.flight.business;
      breakdown.push(
        `✈️ Flights: £${baseCosts.flight.economy} - £${baseCosts.flight.business}`
      );
    }

    if (includeHousing) {
      const housingCost =
        familySize === 1
          ? baseCosts.housing.one_bed
          : familySize === 2
            ? baseCosts.housing.two_bed
            : baseCosts.housing.family;
      totalMin += housingCost;
      totalMax += housingCost * 1.5;
      breakdown.push(
        `🏠 First month housing: £${housingCost} - £${Math.round(housingCost * 1.5)}`
      );

      totalMin += baseCosts.setup.deposits;
      totalMax += baseCosts.setup.deposits * 1.5;
      breakdown.push(`💰 Security deposits: £${baseCosts.setup.deposits}`);
    }

    if (includeMoving) {
      totalMin += baseCosts.moving.minimal;
      totalMax += baseCosts.moving.premium;
      breakdown.push(
        `📦 Moving services: £${baseCosts.moving.minimal} - £${baseCosts.moving.premium}`
      );
    }

    // Always include setup costs
    const setupTotal = Object.values(baseCosts.setup).reduce(
      (a, b) => a + b,
      0
    );
    totalMin += setupTotal;
    totalMax += setupTotal;
    breakdown.push(
      `🔧 Setup costs (utilities, groceries, etc.): £${setupTotal}`
    );

    // Add 10% contingency
    const contingency = Math.round(totalMin * 0.1);
    totalMin += contingency;
    totalMax += Math.round(totalMax * 0.1);
    breakdown.push(`📊 10% contingency fund: £${contingency}+`);

    return `Estimated relocation costs to ${destinationCity} for ${familySize} ${familySize === 1 ? "person" : "people"}:

**Total Range: £${totalMin.toLocaleString()} - £${totalMax.toLocaleString()}**

**Breakdown:**
${breakdown.join("\n")}

**Money-saving tips:**
• Book flights 2-3 months in advance
• Consider temporary accommodation initially
• Ship only essential items
• Research tax treaties to avoid double taxation

Would you like me to provide more details on any specific cost category?`;
  },
});
