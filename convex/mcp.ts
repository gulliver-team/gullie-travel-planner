import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

// Exa MCP Server Configuration
const EXA_SERVER_URL = "https://server.smithery.ai/exa/mcp";
const EXA_API_KEY = process.env.EXA_API_KEY as string;
const EXA_PROFILE = process.env.EXA_PROFILE as string;

// Construct server URL with authentication
const url = new URL(EXA_SERVER_URL);
url.searchParams.set("api_key", EXA_API_KEY);
url.searchParams.set("profile", EXA_PROFILE);
const serverUrl = url.toString();

// Create MCP transport and client
const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
const client = new Client({
  name: "exa-search-smithery-mcp",
  version: "1.0.0",
});

// Travel search preferences
export type TravelPreference =
  | "cheapest"
  | "luxury"
  | "fastest"
  | "cost-effective";

export interface ExaSearchResult {
  title: string;
  url: string;
  text: string;
  published: string;
  author?: string;
  score: number;
}

export interface TravelSearchQuery {
  departure_city: string;
  arrival_city: string;
  preference: TravelPreference;
  dates?: {
    departure: string;
    return?: string;
  };
  budget?: number;
  currency?: string;
}

// Initialize MCP client connection
export async function initializeExaClient() {
  try {
    await client.connect(transport);
    console.log("✅ Exa MCP client connected successfully");

    // List available tools
    const tools = await client.listTools();
    console.log(
      `🔧 Available Exa tools: ${(tools as unknown as any[])
        .map((t: any) => t.name)
        .join(", ")}`
    );

    return client;
  } catch (error) {
    console.error("❌ Failed to connect to Exa MCP server:", error);
    throw error;
  }
}

// Search for travel information using Exa
export async function searchTravelInfo(
  query: TravelSearchQuery
): Promise<ExaSearchResult[]> {
  try {
    const client = await initializeExaClient();

    // Create search query based on preference
    const searchQuery = createSearchQuery(query);

    // Use Exa's search capabilities
    const searchResult = await client.callTool({
      name: "search",
      arguments: {
        query: searchQuery,
        num_results: 10,
        include_domains: [
          "skyscanner.com",
          "kayak.com",
          "booking.com",
          "airbnb.com",
          "expedia.com",
          "hotels.com",
          "tripadvisor.com",
          "lonelyplanet.com",
          "nomadlist.com",
        ],
        exclude_domains: [],
        use_autoprompt: true,
        type: "keyword",
      },
    });

    return processSearchResults(searchResult);
  } catch (error) {
    console.error("❌ Exa search failed:", error);
    return [];
  }
}

// Create optimized search query based on travel preference
function createSearchQuery(query: TravelSearchQuery): string {
  const { departure_city, arrival_city, preference, dates, budget } = query;

  let searchQuery = `travel from ${departure_city} to ${arrival_city}`;

  switch (preference) {
    case "cheapest":
      searchQuery += " cheapest flights budget travel low cost accommodation";
      break;
    case "luxury":
      searchQuery +=
        " luxury travel premium flights 5 star hotels exclusive experiences";
      break;
    case "fastest":
      searchQuery += " fastest flights direct routes quickest travel time";
      break;
    case "cost-effective":
      searchQuery +=
        " best value flights mid-range hotels optimal price quality ratio";
      break;
  }

  if (dates?.departure) {
    searchQuery += ` ${dates.departure}`;
  }

  if (budget) {
    searchQuery += ` under ${budget} ${query.currency || "USD"}`;
  }

  return searchQuery;
}

// Process and filter search results
function processSearchResults(searchResult: any): ExaSearchResult[] {
  try {
    if (!searchResult || !searchResult.results) {
      return [];
    }

    return searchResult.results.map((result: any) => ({
      title: result.title || "No title",
      url: result.url || "",
      text: result.text || result.snippet || "",
      published: result.published || "",
      author: result.author,
      score: result.score || 0,
    }));
  } catch (error) {
    console.error("❌ Failed to process search results:", error);
    return [];
  }
}

// Get specific travel information based on preference
export async function getTravelRecommendations(query: TravelSearchQuery) {
  const searchResults = await searchTravelInfo(query);

  // Categorize results by type
  const categorizedResults = {
    flights: searchResults.filter(
      (r) =>
        r.text.toLowerCase().includes("flight") ||
        r.url.includes("skyscanner") ||
        r.url.includes("kayak")
    ),
    accommodation: searchResults.filter(
      (r) =>
        r.text.toLowerCase().includes("hotel") ||
        r.text.toLowerCase().includes("accommodation") ||
        r.url.includes("airbnb") ||
        r.url.includes("booking")
    ),
    general: searchResults.filter(
      (r) =>
        !r.text.toLowerCase().includes("flight") &&
        !r.text.toLowerCase().includes("hotel") &&
        !r.text.toLowerCase().includes("accommodation")
    ),
  };

  return {
    preference: query.preference,
    total_results: searchResults.length,
    categorized_results: categorizedResults,
    top_recommendations: searchResults.slice(0, 5),
    search_query: createSearchQuery(query),
  };
}

// Get all four preference types for comparison
export async function getAllTravelPreferences(
  query: Omit<TravelSearchQuery, "preference">
) {
  const preferences: TravelPreference[] = [
    "cheapest",
    "luxury",
    "fastest",
    "cost-effective",
  ];

  const results = await Promise.all(
    preferences.map(async (preference) => {
      const searchQuery: TravelSearchQuery = { ...query, preference };
      const recommendations = await getTravelRecommendations(searchQuery);
      return recommendations;
    })
  );

  return {
    departure_city: query.departure_city,
    arrival_city: query.arrival_city,
    search_date: new Date().toISOString(),
    preferences: results,
  };
}

// Close MCP client connection
export async function closeExaClient() {
  try {
    await client.close();
    console.log("✅ Exa MCP client closed successfully");
  } catch (error) {
    console.error("❌ Failed to close Exa MCP client:", error);
  }
}

// Export client for use in other modules
export { client as exaClient };
