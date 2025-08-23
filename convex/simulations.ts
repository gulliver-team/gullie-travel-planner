import { v } from "convex/values";
import { action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { OpenAI } from "openai";

const SCENARIO_LABELS = {
  cheapest: "The Frugal Mover",
  balanced: "The Balanced Mover",
  fastest: "The Fast-Track Mover",
  luxury: "The Premier Mover",
} as const;

type ScenarioType = keyof typeof SCENARIO_LABELS;

function buildMessages(
  _payload: {
    start_city?: string;
    destination_city?: string;
    budget_range?: string;
    move_month?: string;
    context?: string;
  },
  scenario: ScenarioType
) {
  const payload = {
    start_city: _payload.start_city?.trim() || "",
    destination_city: _payload.destination_city?.trim() || "",
    budget_range: _payload.budget_range?.trim() || "",
    move_month: _payload.move_month?.trim() || "",
    context: _payload.context?.trim() || "",
  };
  const scenarioLabel = SCENARIO_LABELS[scenario];

  const scenarioBias = {
    cheapest:
      "Prioritize minimizing cost. Prefer DIY options, budget flights, shared or modest housing, and longer timelines if it saves money.",
    balanced:
      "Balance cost, time, and convenience. Choose realistic, middle-of-the-road options likely for most movers.",
    fastest:
      "Prioritize speed. Use approaches that reduce waiting time even at higher cost; consider premium processing, temporary housing to accelerate arrival, etc.",
    luxury:
      "Prioritize convenience and service quality. Assume use of relocation agents, premium services, and higher budgets to reduce stress and delays.",
  }[scenario];

  const system = `
ROLE AND GOAL
You are an expert relocation logistics simulator. Your goal is to generate one distinct, realistic simulation for the mover based on the provided inputs and the specified scenario style.

CORE VARIABLES (INPUTS)
- Profile: Not provided explicitly; infer a reasonable baseline family profile unless context specifies otherwise.
- Origin: ${payload.start_city}
- Destination: ${payload.destination_city}
- Budget Range: ${payload.budget_range}
- Ideal Move Month: ${payload.move_month}
- Additional Context: ${payload.context}

SIMULATION LOGIC (PROCESS)
For the destination, simulate the full relocation process and estimate both cost and time for:
1) Visa & Immigration (path, docs, processing times, fees)
2) Pet Relocation (requirements, costs, timeline) if relevant
3) Housing (rental process, average rent, deposits, agent fees)
4) Cost of Living Adjustment (salary vs. taxes and expenses)
5) Setup Costs (shipping, flights, temporary housing)
6) Timeline Estimation (Gantt-style phases with dependencies)

SCENARIO STYLE
Scenario: ${scenarioLabel}
Guidance: ${scenarioBias}

OUTPUT FORMAT
Return a concise Markdown block containing:
- ${scenarioLabel}
- Bullet summaries for each factor with concrete estimates but each o
- Total Estimated Cost (USD) and Estimated Timeline (months)
- One major pro and one major con
- A feasibility score (1-10)
`.trim();

  const user =
    "Using the inputs above, produce the simulation. Be concrete and avoid filler.";

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

function buildMessagesWithSearchData(
  _payload: {
    start_city?: string;
    destination_city?: string;
    budget_range?: string;
    move_month?: string;
    context?: string;
  },
  scenario: ScenarioType,
  searchData: any
) {
  const payload = {
    start_city: _payload.start_city?.trim() || "",
    destination_city: _payload.destination_city?.trim() || "",
    budget_range: _payload.budget_range?.trim() || "",
    move_month: _payload.move_month?.trim() || "",
    context: _payload.context?.trim() || "",
  };
  const scenarioLabel = SCENARIO_LABELS[scenario];

  const scenarioBias = {
    cheapest:
      "Prioritize minimizing cost. Prefer DIY options, budget flights, shared or modest housing, and longer timelines if it saves money.",
    balanced:
      "Balance cost, time, and convenience. Choose realistic, middle-of-the-road options likely for most movers.",
    fastest:
      "Prioritize speed. Use approaches that reduce waiting time even at higher cost; consider premium processing, temporary housing to accelerate arrival, etc.",
    luxury:
      "Prioritize convenience and service quality. Assume use of relocation agents, premium services, and higher budgets to reduce stress and delays.",
  }[scenario];

  let realTimeContext = "";
  if (searchData && searchData.analysis) {
    realTimeContext = `

REAL-TIME SEARCH DATA (from web research):
- Visa Requirements: ${searchData.analysis.visaSummary}
- Housing Market: ${searchData.analysis.housingSummary}
- Cost of Living: ${searchData.analysis.costSummary}
- Transport Options: ${searchData.analysis.transportSummary}
${searchData.analysis.educationSummary ? `- Education: ${searchData.analysis.educationSummary}` : ""}
${searchData.analysis.petSummary ? `- Pet Relocation: ${searchData.analysis.petSummary}` : ""}
- Estimated Total Cost: ${searchData.analysis.totalEstimatedCost}
- Estimated Timeline: ${searchData.analysis.estimatedTimeline}
- Data Confidence: ${Math.round(searchData.analysis.confidenceScore * 100)}%

Use this real-time data to inform your simulation and make it more accurate and current.`;
  }

  const system = `
ROLE AND GOAL
You are an expert relocation logistics simulator. Your goal is to generate one distinct, realistic simulation for the mover based on the provided inputs, real-time web data, and the specified scenario style.

CORE VARIABLES (INPUTS)
- Profile: Not provided explicitly; infer a reasonable baseline family profile unless context specifies otherwise.
- Origin: ${payload.start_city}
- Destination: ${payload.destination_city}
- Budget Range: ${payload.budget_range}
- Ideal Move Month: ${payload.move_month}
- Additional Context: ${payload.context}
${realTimeContext}

SIMULATION LOGIC (PROCESS)
For the destination, simulate the full relocation process and estimate both cost and time for:
1) Visa & Immigration (path, docs, processing times, fees) - USE REAL-TIME DATA
2) Pet Relocation (requirements, costs, timeline) if relevant - USE REAL-TIME DATA
3) Housing (rental process, average rent, deposits, agent fees) - USE REAL-TIME DATA
4) Cost of Living Adjustment (salary vs. taxes and expenses) - USE REAL-TIME DATA
5) Setup Costs (shipping, flights, temporary housing) - USE REAL-TIME DATA
6) Timeline Estimation (Gantt-style phases with dependencies)

SCENARIO STYLE
Scenario: ${scenarioLabel}
Guidance: ${scenarioBias}

OUTPUT FORMAT
Return a concise Markdown block containing:
- ${scenarioLabel}
- Bullet summaries for each factor with concrete estimates based on real-time data
- Total Estimated Cost (USD) and Estimated Timeline (months) - align with search data
- One major pro and one major con
- A feasibility score (1-10)
`.trim();

  const user =
    "Using the inputs above and the real-time search data, produce the simulation. Be concrete, accurate, and avoid filler.";

  return [
    { role: "system" as const, content: system },
    { role: "user" as const, content: user },
  ];
}

export const streamSimulation = action({
  args: {
    start_city: v.optional(v.string()),
    destination_city: v.optional(v.string()),
    budget_range: v.optional(v.string()),
    move_month: v.optional(v.string()),
    context: v.optional(v.string()),
    scenario: v.union(
      v.literal("cheapest"),
      v.literal("fastest"),
      v.literal("balanced"),
      v.literal("luxury")
    ),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API,
    });

    // Parse cities to extract city and country
    const parseLocation = (location: string) => {
      const parts = location?.split(',').map(p => p.trim()) || [];
      if (parts.length >= 2) {
        const country = parts[parts.length - 1];
        const city = parts.slice(0, -1).join(', ');
        return { city, country };
      }
      return { city: location || '', country: '' };
    };

    const origin = parseLocation(args.start_city || '');
    const destination = parseLocation(args.destination_city || '');

    // Parse budget range
    let budgetMin: number | undefined;
    let budgetMax: number | undefined;
    if (args.budget_range) {
      const budgetMatch = args.budget_range.match(/\$?([\d,]+)\s*[-–]\s*\$?([\d,]+)/);
      if (budgetMatch) {
        budgetMin = parseInt(budgetMatch[1].replace(/,/g, ''));
        budgetMax = parseInt(budgetMatch[2].replace(/,/g, ''));
      }
    }

    // Call Exa search to get real-time data
    let searchData: any;
    try {
      searchData = await ctx.runAction(internal.internal.relocationSearch.performStructuredSearch, {
        originCity: origin.city,
        originCountry: origin.country,
        destinationCity: destination.city,
        destinationCountry: destination.country,
        scenario: args.scenario,
        budgetMin,
        budgetMax,
        moveMonth: args.move_month,
        context: args.context,
      });
    } catch (error) {
      console.error("Exa search failed:", error);
      searchData = null;
    }

    // Build enhanced messages with Exa search data
    const messages = buildMessagesWithSearchData(
      {
        start_city: args.start_city,
        destination_city: args.destination_city,
        budget_range: args.budget_range,
        move_month: args.move_month,
        context: args.context,
      },
      args.scenario,
      searchData
    );

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
    });

    const chunks: string[] = [];
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        chunks.push(content);
      }
    }

    const result = chunks.join("");
    
    // Return both the simulation and search data
    return {
      simulation: result,
      searchData: searchData ? {
        sources: {
          visa: searchData.searchData.visaRequirements.slice(0, 2).map((s: any) => ({
            title: s.title,
            url: s.url,
          })),
          housing: searchData.searchData.housingMarket.slice(0, 2).map((s: any) => ({
            title: s.title,
            url: s.url,
          })),
          cost: searchData.searchData.costOfLiving.slice(0, 2).map((s: any) => ({
            title: s.title,
            url: s.url,
          })),
        },
        insights: searchData.analysis,
      } : null,
    };
  },
});

export const generateTimeline = action({
  args: {
    scenario_key: v.optional(v.string()),
    scenario_title: v.optional(v.string()),
    raw_text: v.string(),
    preferences: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const openai = new OpenAI({
      apiKey: process.env.OPEN_AI_API,
    });

    let rawText = args.raw_text.trim();
    if (rawText.length > 12000) {
      rawText = rawText.substring(0, 12000);
    }

    const schemaDesc = {
      headline: "string",
      budget_total_usd: "number",
      timeframe_months: "integer",
      phases: [
        {
          name: "string",
          start_month: "integer",
          end_month: "integer",
          summary: "string",
          tasks: [
            {
              title: "string",
              desc: "string",
              cost_usd: "number",
              duration_weeks: "number",
              milestone: "boolean",
            },
          ],
        },
      ],
      milestones: [{ title: "string", month: "number", note: "string" }],
      notes: "string",
      confidence: "number between 0 and 1",
    };

    const system =
      "You are a relocation timeline extractor. Read the scenario text and produce a concise, normalized timeline JSON matching the provided schema. Use reasonable defaults when needed. Return strictly valid JSON with no prose.";

    const user = {
      scenario_key: args.scenario_key,
      scenario_title: args.scenario_title,
      preferences: args.preferences || {},
      schema: schemaDesc,
      scenario_text: rawText,
      rules: [
        "Infer total budget (USD) and timeframe (months) if implied",
        "Limit tasks per phase to at most 6 concise items",
        "Mark key steps as milestone: true",
        "Clamp negative numbers to zero and omit impossible fields",
        "Omit null fields where not applicable",
      ],
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system + " Strictly output JSON only." },
        { role: "user", content: JSON.stringify(user) },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    const data = JSON.parse(content);

    // Coerce numbers to proper types
    if (typeof data.timeframe_months === "number") {
      data.timeframe_months = Math.max(0, Math.round(data.timeframe_months));
    }

    if (Array.isArray(data.phases)) {
      for (const phase of data.phases) {
        if (typeof phase.start_month === "number") {
          phase.start_month = Math.max(0, Math.round(phase.start_month));
        }
        if (typeof phase.end_month === "number") {
          phase.end_month = Math.max(0, Math.round(phase.end_month));
        }
        if (
          phase.start_month !== undefined &&
          phase.end_month !== undefined &&
          phase.end_month < phase.start_month
        ) {
          phase.end_month = phase.start_month;
        }
      }
    }

    return data;
  },
});
