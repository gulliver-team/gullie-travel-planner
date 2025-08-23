import { z } from "zod";

//TODO: Add EXA_API_KEY to .env.local
// Get from: https://dashboard.exa.ai

const EXA_API_URL = "https://api.exa.ai/search";

export const ExaSearchSchema = z.object({
  query: z.string().describe("Search query for visa and relocation information"),
  fromCountry: z.string().describe("Country of origin"),
  toCountry: z.string().describe("Destination country"),
  searchType: z.enum(["visa", "flight", "housing", "school", "general"]),
});

export type ExaSearchParams = z.infer<typeof ExaSearchSchema>;

export async function searchWithExa(params: ExaSearchParams) {
  const apiKey = process.env.EXA_API_KEY;
  
  if (!apiKey) {
    throw new Error("EXA_API_KEY not configured");
  }

  const searchQuery = buildSearchQuery(params);
  
  try {
    const response = await fetch(EXA_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        query: searchQuery,
        num_results: 10,
        contents: {
          text: true,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Exa API error: ${response.statusText}`);
    }

    const data = await response.json();
    return processExaResults(data, params.searchType);
  } catch (error) {
    console.error("Exa search failed:", error);
    throw error;
  }
}

function buildSearchQuery(params: ExaSearchParams): string {
  const { query, fromCountry, toCountry, searchType } = params;
  
  switch (searchType) {
    case "visa":
      return `${fromCountry} to ${toCountry} visa requirements application process timeline cost ${query}`;
    case "flight":
      return `flights from ${fromCountry} to ${toCountry} cheapest airlines direct routes ${query}`;
    case "housing":
      return `${toCountry} housing rental apartments accommodation cost areas ${query}`;
    case "school":
      return `${toCountry} schools education international enrollment ${query}`;
    default:
      return `${fromCountry} to ${toCountry} relocation moving ${query}`;
  }
}

interface ExaResult {
  title: string;
  url: string;
  text: string;
  score: number;
}

interface ExaResponse {
  results?: ExaResult[];
}

function processExaResults(data: ExaResponse, searchType: string) {
  const results = data.results || [];
  
  return results.map((result: ExaResult) => ({
    title: result.title,
    url: result.url,
    text: result.text,
    relevanceScore: result.score,
    searchType,
    highlights: extractHighlights(result.text, searchType),
  }));
}

function extractHighlights(text: string, searchType: string): string[] {
  const highlights: string[] = [];
  
  // Extract key information based on search type
  const patterns: Record<string, RegExp[]> = {
    visa: [
      /processing time:?\s*([^.]+)/i,
      /cost:?\s*([^.]+)/i,
      /requirements?:?\s*([^.]+)/i,
    ],
    flight: [
      /price:?\s*([^.]+)/i,
      /duration:?\s*([^.]+)/i,
      /airline:?\s*([^.]+)/i,
    ],
    housing: [
      /rent:?\s*([^.]+)/i,
      /area:?\s*([^.]+)/i,
      /bedroom:?\s*([^.]+)/i,
    ],
    school: [
      /tuition:?\s*([^.]+)/i,
      /enrollment:?\s*([^.]+)/i,
      /curriculum:?\s*([^.]+)/i,
    ],
  };
  
  const relevantPatterns = patterns[searchType] || [];
  
  for (const pattern of relevantPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      highlights.push(match[1].trim().substring(0, 100));
    }
  }
  
  return highlights.slice(0, 3);
}

const searchVisaParams = z.object({
  fromCountry: z.string(),
  toCountry: z.string(),
  visaType: z.string().optional(),
});

const searchFlightsParams = z.object({
  fromCity: z.string(),
  toCity: z.string(),
  dateRange: z.string().optional(),
});

const searchHousingParams = z.object({
  city: z.string(),
  budget: z.string().optional(),
  type: z.string().optional(),
});

const searchSchoolsParams = z.object({
  city: z.string(),
  level: z.string().optional(),
  international: z.boolean().optional(),
});

export const mcpExaTools = {
  searchVisa: {
    description: "Search for visa requirements and application information",
    parameters: searchVisaParams,
    execute: async (params: z.infer<typeof searchVisaParams>) => {
      return searchWithExa({
        query: params.visaType || "visa requirements",
        fromCountry: params.fromCountry,
        toCountry: params.toCountry,
        searchType: "visa",
      });
    },
  },
  
  searchFlights: {
    description: "Search for flight options and pricing",
    parameters: searchFlightsParams,
    execute: async (params: z.infer<typeof searchFlightsParams>) => {
      return searchWithExa({
        query: params.dateRange || "flight options",
        fromCountry: params.fromCity,
        toCountry: params.toCity,
        searchType: "flight",
      });
    },
  },
  
  searchHousing: {
    description: "Search for housing and accommodation options",
    parameters: searchHousingParams,
    execute: async (params: z.infer<typeof searchHousingParams>) => {
      return searchWithExa({
        query: `${params.budget || ""} ${params.type || "housing"}`,
        fromCountry: "",
        toCountry: params.city,
        searchType: "housing",
      });
    },
  },
  
  searchSchools: {
    description: "Search for schools and education options",
    parameters: searchSchoolsParams,
    execute: async (params: z.infer<typeof searchSchoolsParams>) => {
      return searchWithExa({
        query: `${params.level || ""} ${params.international ? "international" : ""} schools`,
        fromCountry: "",
        toCountry: params.city,
        searchType: "school",
      });
    },
  },
};