import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { createExaService, type ExaSearchResult } from "../services/exaService";
import { OpenAI } from "openai";

export interface RelocationSearchQuery {
  originCity: string;
  originCountry: string;
  destinationCity: string;
  destinationCountry: string;
  scenario?: "cheapest" | "fastest" | "balanced" | "luxury";
  budgetMin?: number;
  budgetMax?: number;
  moveMonth?: string;
  context?: string;
}

export interface StructuredSearchData {
  visaRequirements: ExaSearchResult[];
  housingMarket: ExaSearchResult[];
  costOfLiving: ExaSearchResult[];
  transportOptions: ExaSearchResult[];
  schoolsEducation: ExaSearchResult[];
  petRelocation: ExaSearchResult[];
  localInsights: ExaSearchResult[];
  workOpportunities: ExaSearchResult[];
}

export interface RelocationSearchOutput {
  query: RelocationSearchQuery;
  searchData: StructuredSearchData;
  analysis: {
    visaSummary: string;
    housingSummary: string;
    costSummary: string;
    transportSummary: string;
    educationSummary?: string;
    petSummary?: string;
    totalEstimatedCost: string;
    estimatedTimeline: string;
    confidenceScore: number;
  };
  timestamp: string;
}

export const performStructuredSearch = internalAction({
  args: {
    originCity: v.string(),
    originCountry: v.string(),
    destinationCity: v.string(),
    destinationCountry: v.string(),
    scenario: v.optional(v.union(
      v.literal("cheapest"),
      v.literal("fastest"),
      v.literal("balanced"),
      v.literal("luxury")
    )),
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    moveMonth: v.optional(v.string()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<RelocationSearchOutput> => {
    const exaService = createExaService();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    
    const scenario = args.scenario || "balanced";
    const scenarioModifiers = {
      cheapest: "budget affordable cheap economical DIY",
      fastest: "expedited express priority fast-track urgent",
      balanced: "standard reasonable practical moderate",
      luxury: "premium luxury high-end exclusive concierge VIP"
    };
    
    const modifier = scenarioModifiers[scenario];
    const budgetRange = args.budgetMin && args.budgetMax 
      ? `$${args.budgetMin.toLocaleString()} to $${args.budgetMax.toLocaleString()}`
      : "";
    
    const hasFamily = args.context?.toLowerCase().includes("family") || 
                     args.context?.toLowerCase().includes("child") ||
                     args.context?.toLowerCase().includes("school");
    
    const hasPets = args.context?.toLowerCase().includes("pet") || 
                   args.context?.toLowerCase().includes("dog") || 
                   args.context?.toLowerCase().includes("cat");
    
    const searchQueries = [
      {
        category: "visaRequirements",
        query: `${args.destinationCountry} visa requirements immigration ${args.originCountry} citizens ${modifier} ${args.moveMonth || "2025"} work permit residence`,
      },
      {
        category: "housingMarket",
        query: `${args.destinationCity} rental housing apartments ${modifier} ${budgetRange} expat neighborhoods ${args.moveMonth || "2025"}`,
      },
      {
        category: "costOfLiving",
        query: `${args.destinationCity} cost of living expenses monthly budget ${budgetRange} compared to ${args.originCity}`,
      },
      {
        category: "transportOptions",
        query: `moving from ${args.originCity} to ${args.destinationCity} international relocation shipping ${modifier} services`,
      },
      {
        category: "workOpportunities",
        query: `${args.destinationCity} job market employment opportunities ${args.originCountry} expats salary ranges`,
      },
      {
        category: "localInsights",
        query: `${args.destinationCity} expat community living experience quality of life safety ${modifier}`,
      },
    ];
    
    if (hasFamily) {
      searchQueries.push({
        category: "schoolsEducation",
        query: `${args.destinationCity} international schools education family children ${modifier} tuition fees`,
      });
    }
    
    if (hasPets) {
      searchQueries.push({
        category: "petRelocation",
        query: `bringing pets from ${args.originCountry} to ${args.destinationCountry} requirements quarantine vaccination import`,
      });
    }
    
    const searchPromises = searchQueries.map(({ query }) => 
      exaService.search({
        query,
        numResults: 5,
        type: "neural",
        startPublishedDate: "2024-01-01",
        text: true,
      }).catch(error => {
        console.error(`Search failed for query: ${query}`, error);
        return [];
      })
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    const structuredData: StructuredSearchData = {
      visaRequirements: searchResults[0] || [],
      housingMarket: searchResults[1] || [],
      costOfLiving: searchResults[2] || [],
      transportOptions: searchResults[3] || [],
      workOpportunities: searchResults[4] || [],
      localInsights: searchResults[5] || [],
      schoolsEducation: hasFamily ? (searchResults[6] || []) : [],
      petRelocation: hasPets ? (searchResults[hasFamily ? 7 : 6] || []) : [],
    };
    
    const analysis = await analyzeSearchResults(structuredData, args, openai);
    
    return {
      query: {
        originCity: args.originCity,
        originCountry: args.originCountry,
        destinationCity: args.destinationCity,
        destinationCountry: args.destinationCountry,
        scenario,
        budgetMin: args.budgetMin,
        budgetMax: args.budgetMax,
        moveMonth: args.moveMonth,
        context: args.context,
      },
      searchData: structuredData,
      analysis,
      timestamp: new Date().toISOString(),
    };
  },
});

async function analyzeSearchResults(
  data: StructuredSearchData,
  args: any,
  openai: OpenAI
): Promise<RelocationSearchOutput["analysis"]> {
  const prompt = `Analyze these search results for relocating from ${args.originCity}, ${args.originCountry} to ${args.destinationCity}, ${args.destinationCountry}.

Scenario: ${args.scenario || "balanced"}
Budget: ${args.budgetMin && args.budgetMax ? `$${args.budgetMin}-$${args.budgetMax}` : "Not specified"}
Timeline: ${args.moveMonth || "Not specified"}
Context: ${args.context || "Individual relocation"}

Search Results Summary:
- Visa Requirements: ${data.visaRequirements.length} sources found
- Housing Market: ${data.housingMarket.length} sources found
- Cost of Living: ${data.costOfLiving.length} sources found
- Transport Options: ${data.transportOptions.length} sources found

Top Visa Information:
${data.visaRequirements.slice(0, 2).map(r => `${r.title}: ${r.text?.substring(0, 300)}`).join("\n")}

Top Housing Information:
${data.housingMarket.slice(0, 2).map(r => `${r.title}: ${r.text?.substring(0, 300)}`).join("\n")}

Top Cost Information:
${data.costOfLiving.slice(0, 2).map(r => `${r.title}: ${r.text?.substring(0, 300)}`).join("\n")}

Please provide a JSON response with:
{
  "visaSummary": "2-3 sentence summary of visa requirements and process",
  "housingSummary": "2-3 sentence summary of housing options and costs",
  "costSummary": "2-3 sentence summary of overall cost of living",
  "transportSummary": "2-3 sentence summary of moving/transport options",
  "educationSummary": "2-3 sentence summary if family context, otherwise null",
  "petSummary": "2-3 sentence summary if pets mentioned, otherwise null",
  "totalEstimatedCost": "Range in USD format like '$15,000 - $25,000'",
  "estimatedTimeline": "Timeline like '2-3 months' or '6-8 weeks'",
  "confidenceScore": 0.1 to 1.0 based on data quality
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a relocation expert analyzing search data. Respond only with valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    const content = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);
    
    return {
      visaSummary: parsed.visaSummary || "Visa requirements analysis pending.",
      housingSummary: parsed.housingSummary || "Housing market analysis pending.",
      costSummary: parsed.costSummary || "Cost of living analysis pending.",
      transportSummary: parsed.transportSummary || "Transport options analysis pending.",
      educationSummary: parsed.educationSummary,
      petSummary: parsed.petSummary,
      totalEstimatedCost: parsed.totalEstimatedCost || "TBD",
      estimatedTimeline: parsed.estimatedTimeline || "TBD",
      confidenceScore: parsed.confidenceScore || 0.5,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    
    return {
      visaSummary: "Visa requirements vary based on nationality and purpose of stay.",
      housingSummary: "Housing costs depend on location and accommodation type.",
      costSummary: "Cost of living varies by lifestyle and location within the city.",
      transportSummary: "Multiple transport and moving options available.",
      educationSummary: args.context?.includes("family") ? "International schools available." : undefined,
      petSummary: args.context?.includes("pet") ? "Pet relocation requires advance planning." : undefined,
      totalEstimatedCost: "$10,000 - $30,000",
      estimatedTimeline: "2-6 months",
      confidenceScore: 0.3,
    };
  }
}