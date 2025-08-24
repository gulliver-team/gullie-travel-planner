import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import Exa from "exa-js";

interface SearchResult {
  title: string;
  url: string;
  summary: string;
  publishedDate?: string;
  score: number;
}

interface StructuredSearchOutput {
  scenarioKey: string;
  searchResults: {
    visaRequirements: SearchResult[];
    housingMarket: SearchResult[];
    costOfLiving: SearchResult[];
    transportOptions: SearchResult[];
    schoolsEducation: SearchResult[];
    petRelocation: SearchResult[];
    localInsights: SearchResult[];
  };
  summary: {
    totalCost?: string;
    timeline?: string;
    visaPath?: string;
    housingStrategy?: string;
    petProcess?: string;
  };
  metadata: {
    searchTimestamp: string;
    totalResultsFound: number;
    confidence: number;
  };
}

export const performRelocationSearch = action({
  args: {
    startCity: v.string(),
    destinationCity: v.string(),
    scenario: v.union(
      v.literal("cheapest"),
      v.literal("fastest"),
      v.literal("balanced"),
      v.literal("luxury")
    ),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    moveMonth: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<StructuredSearchOutput> => {
    const exa = new Exa(process.env.EXA_API_KEY);
    
    const scenarioModifiers = {
      cheapest: "budget affordable cheap low-cost DIY",
      fastest: "expedited fast-track premium processing quick",
      balanced: "reasonable practical moderate standard",
      luxury: "premium luxury high-end exclusive concierge"
    };
    
    const modifier = scenarioModifiers[args.scenario];
    const budgetContext = args.budgetMin && args.budgetMax 
      ? `budget $${args.budgetMin}-$${args.budgetMax}` 
      : "";
    const familyContext = args.context?.toLowerCase().includes("family") ? "family" : "";
    const petContext = args.context?.toLowerCase().includes("pet") || args.context?.toLowerCase().includes("dog") || args.context?.toLowerCase().includes("cat") 
      ? "pet dog cat animal" 
      : "";
    
    const searchQueries = {
      visaRequirements: [
        `${args.destinationCity} visa requirements immigration process from ${args.startCity} ${modifier}`,
        `relocating to ${args.destinationCity} visa pathways residency permits ${args.moveMonth || "2025"}`,
      ],
      housingMarket: [
        `${args.destinationCity} rental housing apartments ${modifier} ${budgetContext} ${familyContext}`,
        `${args.destinationCity} real estate rental prices neighborhoods expat areas ${args.moveMonth || "2025"}`,
      ],
      costOfLiving: [
        `${args.destinationCity} cost of living expenses ${budgetContext} compared to ${args.startCity}`,
        `${args.destinationCity} monthly expenses utilities groceries transportation ${modifier}`,
      ],
      transportOptions: [
        `${args.startCity} to ${args.destinationCity} moving shipping relocation services ${modifier}`,
        `international moving companies shipping costs ${args.startCity} ${args.destinationCity}`,
      ],
      schoolsEducation: familyContext ? [
        `${args.destinationCity} international schools education ${familyContext} ${modifier}`,
        `${args.destinationCity} school districts family neighborhoods children education`,
      ] : [],
      petRelocation: petContext ? [
        `${args.destinationCity} pet relocation import requirements ${petContext} from ${args.startCity}`,
        `bringing pets to ${args.destinationCity} quarantine vaccination requirements ${petContext}`,
      ] : [],
      localInsights: [
        `${args.destinationCity} expat community living experience tips advice ${args.moveMonth || "2025"}`,
        `${args.destinationCity} neighborhoods safety quality of life ${familyContext} ${modifier}`,
      ],
    };
    
    const searchResults: StructuredSearchOutput["searchResults"] = {
      visaRequirements: [],
      housingMarket: [],
      costOfLiving: [],
      transportOptions: [],
      schoolsEducation: [],
      petRelocation: [],
      localInsights: [],
    };
    
    const searchPromises = [];
    
    for (const [category, queries] of Object.entries(searchQueries)) {
      for (const query of queries) {
        if (query) {
          searchPromises.push(
            exa.search(query, {
              type: "neural",
              numResults: 3,
              useAutoprompt: false,
              startPublishedDate: "2024-01-01",
            }).then(response => ({
              category: category as keyof typeof searchResults,
              results: response.results,
            })).catch(err => {
              console.error(`Search error for ${category}:`, err);
              return { category: category as keyof typeof searchResults, results: [] };
            })
          );
        }
      }
    }
    
    const allSearchResults = await Promise.all(searchPromises);
    
    for (const { category, results } of allSearchResults) {
      const formattedResults: SearchResult[] = results.map((result: any) => ({
        title: result.title || "",
        url: result.url || "",
        summary: result.snippet || result.text || "",
        publishedDate: result.publishedDate,
        score: result.score || 0.5,
      }));
      searchResults[category].push(...formattedResults);
    }
    
    const totalResults = Object.values(searchResults).reduce(
      (sum, results) => sum + results.length,
      0
    );
    
    const summary = await generateSummary(searchResults, args);
    
    return {
      scenarioKey: args.scenario,
      searchResults,
      summary,
      metadata: {
        searchTimestamp: new Date().toISOString(),
        totalResultsFound: totalResults,
        confidence: totalResults > 20 ? 0.9 : totalResults > 10 ? 0.7 : 0.5,
      },
    };
  },
});

async function generateSummary(
  searchResults: StructuredSearchOutput["searchResults"],
  args: any
): Promise<StructuredSearchOutput["summary"]> {
  const visaInfo = searchResults.visaRequirements[0]?.summary || "";
  const housingInfo = searchResults.housingMarket[0]?.summary || "";
  const petInfo = searchResults.petRelocation[0]?.summary || "";
  
  const extractCost = (text: string): string | undefined => {
    const costMatch = text.match(/\$[\d,]+(?:\s*-\s*\$[\d,]+)?/);
    return costMatch ? costMatch[0] : undefined;
  };
  
  const extractTimeline = (text: string): string | undefined => {
    const timeMatch = text.match(/\d+\s*(?:days?|weeks?|months?)/i);
    return timeMatch ? timeMatch[0] : undefined;
  };
  
  return {
    totalCost: extractCost(housingInfo) || extractCost(visaInfo),
    timeline: extractTimeline(visaInfo),
    visaPath: visaInfo.substring(0, 200),
    housingStrategy: housingInfo.substring(0, 200),
    petProcess: petInfo ? petInfo.substring(0, 200) : undefined,
  };
}

export const searchAndEnrichSimulation = action({
  args: {
    simulationData: v.object({
      start_city: v.string(),
      destination_city: v.string(),
      budget_min: v.optional(v.string()),
      budget_max: v.optional(v.string()),
      move_month: v.optional(v.string()),
      context: v.optional(v.string()),
      scenario: v.union(
        v.literal("cheapest"),
        v.literal("fastest"),
        v.literal("balanced"),
        v.literal("luxury")
      ),
    }),
  },
  handler: async (ctx, args): Promise<{ searchData: any; enrichedInsights: any }> => {
    const searchData = await ctx.runAction(api.exaSearch.performRelocationSearch, {
      startCity: args.simulationData.start_city,
      destinationCity: args.simulationData.destination_city,
      scenario: args.simulationData.scenario,
      budgetMin: args.simulationData.budget_min ? Number(args.simulationData.budget_min) : undefined,
      budgetMax: args.simulationData.budget_max ? Number(args.simulationData.budget_max) : undefined,
      moveMonth: args.simulationData.move_month,
      context: args.simulationData.context,
    });
    
    return {
      searchData,
      enrichedInsights: {
        topVisaSources: searchData.searchResults.visaRequirements.slice(0, 2),
        topHousingSources: searchData.searchResults.housingMarket.slice(0, 2),
        topCostSources: searchData.searchResults.costOfLiving.slice(0, 2),
        confidence: searchData.metadata.confidence,
      },
    };
  },
});
