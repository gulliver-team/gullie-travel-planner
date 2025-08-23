# Gullie Travel Planner - Convex Backend

This is the backend for a travel planning system that uses **LLM integration with Zod schemas** and **Exa MCP server integration** to provide structured, validated cost simulations and real-time travel search results for international relocations.

## 🚀 **Key Features**

The system is built with Convex and provides:

- **Input Validation**: Zod schemas ensure data integrity and type safety
- **Structured LLM Prompts**: Consistent, detailed prompts for better AI responses
- **Response Validation**: Zod validation ensures LLM responses meet expected structure
- **Real-time Exa Integration**: Live travel data from Exa MCP server
- **4 Travel Preference Types**: Cheapest, luxury, fastest, and cost-effective options
- **Multi-period Analysis**: Provides estimates for 30, 90, and 180 days
- **Cost Categories**: Flight tickets, housing, and furniture moving costs
- **Risk Assessment**: Built-in risk analysis and recommendations

## 🏗️ **Architecture Overview**

### **1. Zod Schema System (`/schemas/zod-schemas.ts`)**

The core of the system uses Zod for:

- **Input Validation**: Ensures all travel inputs meet requirements
- **LLM Response Validation**: Validates AI-generated responses
- **Type Safety**: Full TypeScript integration with runtime validation
- **Structured Prompts**: Consistent LLM prompting for reliable results

#### **Key Schemas:**

- `CostSchema` - Base monetary values with currency
- `FlightCostSchema` - Detailed flight cost breakdown
- `HousingCostSchema` - Property rental and utility costs
- `MovingCostSchema` - Furniture moving and logistics costs
- `SimulationResultSchema` - Complete cost simulation for each time period
- `LLMResponseSchema` - Full AI response structure
- `TravelInputSchema` - User input validation

### **2. Exa MCP Integration (`/mcp.ts`)**

Real-time travel data integration using Exa's MCP server:

- **4 Travel Preferences**: Cheapest, luxury, fastest, cost-effective
- **Live Search Results**: Real-time data from travel websites
- **Categorized Results**: Flights, accommodation, and general travel info
- **Quality Assessment**: Data quality scoring and validation

#### **Travel Preference Types:**

- **🤑 Cheapest**: Budget travel, low-cost accommodation, economy flights
- **💎 Luxury**: Premium flights, 5-star hotels, exclusive experiences
- **⚡ Fastest**: Direct routes, quickest travel time, express options
- **⚖️ Cost-effective**: Best value, optimal price-quality ratio, mid-range options

### **3. Schema Files (`/schemas/`)**

- `user.ts` - User information (name, nationality)
- `city.ts` - Departure/arrival city and country data
- `date.ts` - Travel dates and user associations
- `visa.ts` - Visa requirements and costs
- `flight.ts` - Flight cost information
- `rental.ts` - Housing/rental cost data
- `message.ts` - Message storage with vector embeddings

### **4. LLM Integration (`llm-integration.ts`)**

The main actions that handle:

- Input validation using Zod schemas
- Structured prompt generation
- LLM API calls with consistent formatting
- Response validation and error handling
- **Exa data integration** for enhanced results
- Structured result formatting

### **5. Examples (`/examples/`)**

- `usage-examples.ts` - Basic Zod schema usage examples
- `exa-integration-examples.ts` - Comprehensive Exa integration examples
- Input validation demonstrations
- Prompt generation examples
- Mock LLM response validation
- **Real-time Exa search demonstrations**

## 📋 **Usage**

### **Basic Travel Planning (Legacy)**

```typescript
import { planTravel } from "./llm-integration";

const result = await planTravel({
  user: "user_id",
  departure_city: "New York",
  arrival_city: "London",
  departure_country: "United States",
  arrival_country: "United Kingdom",
});
```

### **Enhanced Travel Planning with Exa Integration**

```typescript
import { planTravelWithExa } from "./llm-integration";

const result = await planTravelWithExa({
  user: "user_id",
  departure_city: "San Francisco",
  arrival_city: "Tokyo",
  departure_country: "United States",
  arrival_country: "Japan",
  budget_constraints: {
    max_total_cost: 15000,
    preferred_currency: "USD",
    cost_priority: "balanced",
  },
  special_requirements: {
    pets: true,
    children: false,
    business_travel: true,
  },
});
```

### **Direct Exa Search Usage**

```typescript
import { getAllTravelPreferences, getTravelRecommendations } from "./mcp";

// Get all 4 preference types
const allOptions = await getAllTravelPreferences({
  departure_city: "Toronto",
  arrival_city: "Berlin",
  budget: 8000,
  currency: "EUR",
});

// Get specific preference type
const luxuryOptions = await getTravelRecommendations({
  departure_city: "London",
  arrival_city: "Dubai",
  preference: "luxury",
  budget: 20000,
  currency: "USD",
});
```

### **Using Zod Schemas Directly**

```typescript
import {
  validateTravelInput,
  validateLLMResponse,
  createStructuredPrompt,
} from "./schemas/zod-schemas";

// Validate user input
const travelInput = {
  departure_city: "Toronto",
  arrival_city: "Berlin",
  // ... other fields
};

const validatedInput = validateTravelInput(travelInput);

// Create structured prompt for LLM
const prompt = createStructuredPrompt(validatedInput);

// Validate LLM response
const validatedResponse = validateLLMResponse(llmResponse);
```

## 🔍 **Response Structure**

### **Enhanced Response with Exa Data**

The system now returns comprehensive results including real-time Exa search data:

```typescript
{
  success: true,
  input: validatedInput,
  exa_search_results: {
    departure_city: "San Francisco",
    arrival_city: "Tokyo",
    search_date: "2024-01-15T10:30:00Z",
    preferences: [
      {
        preference: "cheapest",
        total_results: 12,
        categorized_results: {
          flights: [...],
          accommodation: [...],
          general: [...]
        },
        top_recommendations: [...]
      },
      {
        preference: "luxury",
        total_results: 8,
        // ... similar structure
      },
      // ... fastest and cost-effective preferences
    ]
  },
  simulations: [...], // LLM-generated cost simulations
  general_recommendations: [...],
  market_insights: {...},
  visa_requirements: {...},
  additional_costs: {...},
  metadata: {
    total_cost_30_days: 5000,
    total_cost_90_days: 4330,
    total_cost_180_days: 3870,
    currency: "USD",
    best_time_to_book: "180 days (low season)",
    risk_assessment: "Medium - Limited availability in most periods",
    exa_data_quality: "Excellent - High quality real-time data"
  },
  prompt_metadata: {...}
}
```

## 🤖 **LLM Integration with Zod & Exa**

### **1. Structured Prompting with Real-time Data**

The system uses Zod schemas and Exa data to generate enhanced prompts:

```typescript
// System prompt defines the AI's role and expertise
const systemPrompt = `You are a global mobility expert specializing in international relocation cost analysis...`;

// User prompt is dynamically generated with travel details
const userPrompt = `Analyze the relocation costs for moving from New York, United States to London, United Kingdom...`;

// Enhanced prompt includes Exa search results
const enhancedPrompt = `${userPrompt}

Real-time travel data from Exa search:
${formatExaResultsForPrompt(exaResults)}

${formatInstructions}`;
```

### **2. Response Validation**

Every LLM response is validated against Zod schemas:

```typescript
try {
  const validatedResponse = validateLLMResponse(llmResponse);
  // Response is guaranteed to match expected structure
} catch (error) {
  // Handle validation errors gracefully
  console.error("LLM response validation failed:", error);
  return createFallbackResponse();
}
```

### **3. Exa Data Quality Assessment**

The system automatically assesses the quality of real-time data:

```typescript
function assessExaDataQuality(exaResults: any): string {
  if (!exaResults || !exaResults.preferences) {
    return "No data available";
  }

  const totalResults = exaResults.preferences.reduce(
    (sum: number, pref: any) => sum + pref.total_results,
    0
  );
  const avgResults = totalResults / exaResults.preferences.length;

  if (avgResults >= 8) return "Excellent - High quality real-time data";
  if (avgResults >= 5) return "Good - Moderate quality real-time data";
  if (avgResults >= 3) return "Fair - Limited real-time data";
  return "Poor - Minimal real-time data";
}
```

## 🔧 **Exa MCP Server Configuration**

### **1. Server Setup**

```typescript
// Exa MCP Server Configuration
const EXA_SERVER_URL = "https://server.smithery.ai/exa/mcp";
const EXA_API_KEY = "your_api_key_here";
const EXA_PROFILE = "your_profile_here";

// Create MCP transport and client
const transport = new StreamableHTTPClientTransport(new URL(serverUrl));
const client = new Client({
  name: "exa-search-smithery-mcp",
  version: "1.0.0",
});
```

### **2. Search Configuration**

```typescript
// Use Exa's search capabilities with travel-specific domains
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
    use_autoprompt: true,
    type: "keyword",
  },
});
```

## 🧪 **Testing and Examples**

### **Running Exa Integration Examples**

```typescript
import { runAllExaExamples } from "./examples/exa-integration-examples";

// Run all demonstration examples
await runAllExaExamples();
```

### **Individual Exa Examples**

```typescript
import { examples } from "./examples/exa-integration-examples";

// Use predefined examples
await examples.basic(); // Basic search for all preferences
await examples.specific(); // Specific preference search
await examples.budget(); // Budget comparison across preferences
await examples.family(); // Family travel planning
await examples.business(); // Business travel optimization
await examples.seasonal(); // Seasonal travel planning
```

### **Exa Search Examples**

```typescript
// Example 1: Basic search for all preferences
const allOptions = await getAllTravelPreferences({
  departure_city: "New York",
  arrival_city: "London",
  dates: { departure: "2024-06-01" },
  budget: 5000,
  currency: "USD",
});

// Example 2: Luxury preference search
const luxuryOptions = await getTravelRecommendations({
  departure_city: "San Francisco",
  arrival_city: "Tokyo",
  preference: "luxury",
  budget: 15000,
  currency: "USD",
});

// Example 3: Business travel optimization
const businessOptions = await getAllTravelPreferences({
  departure_city: "Chicago",
  arrival_city: "Singapore",
  budget: 10000,
  currency: "USD",
});
```

## 🚀 **Deployment as MCP Tool**

This system is ready to be deployed as an MCP (Model Context Protocol) tool server that:

- Accepts structured travel planning requests
- Validates all inputs using Zod schemas
- Generates consistent LLM prompts
- **Integrates real-time Exa search data**
- Returns validated, structured cost simulations
- Provides comprehensive risk assessments and recommendations
- **Offers 4 travel preference types for comparison**

### **API Endpoints**

- `POST /api/plan-travel` - Basic travel planning (legacy)
- `POST /api/plan-travel-with-exa` - Enhanced travel planning with Exa integration
- `GET /api/exa-search` - Direct Exa search functionality
- `GET /api/simulations/:id` - Retrieve specific simulation results
- `GET /api/recommendations` - Get general mobility recommendations

## 🔮 **Future Enhancements**

1. **Enhanced Exa Integration**

   - Real-time flight pricing APIs
   - Live accommodation availability
   - Currency exchange rate integration
   - Seasonal trend analysis

2. **Advanced Analytics**

   - Cost trend analysis with real-time data
   - Seasonal pattern recognition
   - Budget optimization recommendations
   - Preference-based learning

3. **Multi-language Support**

   - Localized cost estimates
   - Regional market insights
   - Cultural relocation factors
   - Local Exa search sources

4. **Enhanced Zod Schemas**
   - More granular cost breakdowns
   - Regional-specific validations
   - Dynamic schema generation
   - Exa data validation schemas

## 🛠️ **Development**

### **Running Locally**

```bash
npm install
npx convex dev
```

### **Testing Exa Integration**

```bash
# Test Exa MCP connection
npx convex run mcp:initializeExaClient

# Test travel search
npx convex run mcp:searchTravelInfo --args '{"departure_city":"New York","arrival_city":"London","preference":"cheapest"}'

# Test all preferences
npx convex run mcp:getAllTravelPreferences --args '{"departure_city":"Toronto","arrival_city":"Berlin"}'
```

### **Schema Updates**

After modifying Zod schemas, run:

```bash
npx convex codegen
```

### **Adding New Exa Features**

1. Define new search parameters in `mcp.ts`
2. Add new preference types if needed
3. Update search result processing
4. Add examples to `exa-integration-examples.ts`
5. Update documentation

## 📚 **Contributing**

1. Follow the existing Zod schema structure
2. Add proper TypeScript types and validation
3. Include comprehensive error handling
4. Update documentation and examples
5. Test with various input scenarios
6. Ensure all schemas pass validation
7. **Test Exa integration thoroughly**
8. **Validate real-time data quality**

## 🔗 **Key Benefits of Zod + Exa Integration**

- **Type Safety**: Runtime validation with TypeScript integration
- **Consistent Prompts**: Structured LLM prompting for reliable results
- **Error Prevention**: Catches issues before they reach the LLM
- **Maintainability**: Clear schema definitions and validation rules
- **Scalability**: Easy to extend with new cost categories and requirements
- **Reliability**: Guaranteed response structure for downstream processing
- **Real-time Data**: Live travel information from Exa MCP server
- **Multiple Preferences**: 4 travel preference types for comprehensive planning
- **Data Quality**: Automatic assessment of real-time data quality
- **Enhanced LLM**: Better AI responses with real-time context
