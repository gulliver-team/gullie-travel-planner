import { v } from "convex/values";
import { internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import Exa from "exa-js";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import {
  VisaRequirementsInputSchema,
  VisaRequirementsSchema,
  type VisaRequirementsInput,
  type VisaOptionDetails,
  type VisaRequirements,
} from "../schemas/zod_schemas";
import { z } from "zod";

const EXA_API_KEY = process.env.EXA_API_KEY;

// Schema for structured visa search response
const VisaSearchResponseSchema = z.object({
  visaOptions: z.record(
    z.string(),
    z.object({
      age: z.string(),
      duration: z.string(),
      work: z.string(),
      cost: z.string(),
      processing: z.string(),
      requirement: z.string().optional(),
      path_to_residency: z.string().optional(),
      investment: z.string().optional(),
    })
  ),
  summary: z.string(),
});

// Schema for detailed visa requirements
const DetailedVisaRequirementsSchema = z.object({
  documents: z.array(z.string()),
  process: z.array(z.string()),
  timeline: z.string(),
  costs: z.object({
    application: z.string(),
    health_surcharge: z.string(),
    biometric: z.string(),
    priority_service: z.string(),
  }),
  additional_info: z.string().optional(),
});

// Store visa search results in conversation context
export const storeVisaSearchResult = internalMutation({
  args: {
    callId: v.string(),
    originCountry: v.string(),
    destinationCountry: v.string(),
    visaType: v.optional(v.string()),
    result: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    // Get existing conversation
    const conversation = await ctx.db
      .query("conversations")
      .withIndex("by_call_id", (q) => q.eq("callId", args.callId))
      .first();

    if (conversation) {
      // Add visa search result as a tool message
      const toolMessage = {
        role: "tool" as const,
        content: args.result,
        timestamp: args.timestamp,
        toolCall: {
          name: "visaRequirements",
          arguments: {
            originCountry: args.originCountry,
            destinationCountry: args.destinationCountry,
            visaType: args.visaType,
          },
          result: args.result,
        },
      };

      const updatedTranscript = [...conversation.transcript, toolMessage];
      
      // Update conversation with visa data
      await ctx.db.patch(conversation._id, {
        transcript: updatedTranscript,
        extractedData: {
          ...conversation.extractedData,
          originCountry: args.originCountry,
          destinationCountry: args.destinationCountry,
          visaOptions: args.result,
        },
      });

      // Record the tool call
      await ctx.runMutation(internal.conversations.recordToolCall, {
        callId: args.callId,
        toolCall: {
          name: "visaRequirements",
          timestamp: args.timestamp,
          success: true,
        },
      });
    }
  },
});

// GPT-4o fallback for visa search
async function searchVisaWithGPT(
  originCountry: string,
  destinationCountry: string,
  visaType?: string
): Promise<string> {
  try {
    if (!visaType) {
      // Search for available visa types
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        system: `You are a visa and immigration expert. Provide accurate, up-to-date visa information for ${originCountry} citizens moving to ${destinationCountry}. Include multiple visa options with their requirements, costs, and processing times.`,
        prompt: `List all available visa options for ${originCountry} citizens moving to ${destinationCountry} in 2024-2025. For each visa type, provide:
        - Age requirements (if any)
        - Duration of stay allowed
        - Work rights
        - Approximate cost in local currency
        - Processing time
        - Key requirements
        - Path to residency (if applicable)
        
        Focus on the most common and accessible visa types.`,
        schema: VisaSearchResponseSchema,
      });

      if (Object.keys(object.visaOptions).length > 0) {
        return `As a ${originCountry} citizen moving to ${destinationCountry}, here are your visa options:

${Object.entries(object.visaOptions)
  .map(
    ([type, details]) =>
      `**${type} Visa**:\n` +
      Object.entries(details)
        .filter(([_, value]) => value)
        .map(([key, value]) => `  - ${key.replace(/_/g, " ")}: ${value}`)
        .join("\n")
  )
  .join("\n\n")}

${object.summary}

Would you like me to explain more details about a specific visa type or send you the requirements as a PDF?`;
      }
    } else {
      // Get detailed requirements for specific visa type
      const { object } = await generateObject({
        model: openai("gpt-4o"),
        system: `You are a visa and immigration expert. Provide detailed, accurate requirements for the ${visaType} visa from ${originCountry} to ${destinationCountry}.`,
        prompt: `Provide complete requirements for the ${visaType} visa from ${originCountry} to ${destinationCountry}. Include:
        1. Required documents (be specific)
        2. Step-by-step application process
        3. Processing timeline
        4. Cost breakdown (application fee, health surcharge, biometric, priority service if available)
        5. Additional important information`,
        schema: DetailedVisaRequirementsSchema,
      });

      return `For the ${visaType} visa from ${originCountry} to ${destinationCountry}:

**Required Documents:**
- ${object.documents.join("\n- ")}

**Application Process:**
${object.process.map((step, i) => `${i + 1}. ${step}`).join("\n")}

**Timeline:** ${object.timeline}

**Costs Breakdown:**
- Application fee: ${object.costs.application}
- Health surcharge: ${object.costs.health_surcharge}
- Biometric fee: ${object.costs.biometric}
- Priority service: ${object.costs.priority_service}

${object.additional_info || ""}

*Note: Please verify with the official immigration website for the most up-to-date requirements.*

Would you like me to explain any specific requirement in more detail or send this information as a PDF?`;
    }

    return `I found visa information for moving from ${originCountry} to ${destinationCountry}. Please specify which type of visa you're interested in for more detailed requirements.`;
  } catch (error) {
    console.error("Error with GPT-4o visa search:", error);
    throw error;
  }
}

// Main visa requirements action with automatic triggering
export const getVisaRequirements = internalAction({
  args: {
    callId: v.string(),
    originCountry: v.string(),
    destinationCountry: v.string(),
    visaType: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Validate input using Zod schema
    const validatedInput: VisaRequirementsInput = VisaRequirementsInputSchema.parse({
      originCountry: args.originCountry,
      destinationCountry: args.destinationCountry,
      visaType: args.visaType,
    });

    const { originCountry, destinationCountry, visaType } = validatedInput;
    const timestamp = Date.now();

    try {
      // Try Exa search first
      const exa = new Exa(EXA_API_KEY);
      let result: string;

      if (!visaType) {
        // Search for available visa types for the route
        const searchQuery = `comprehensive visa options for ${originCountry} citizens moving to ${destinationCountry} 2024 2025 official government immigration:`;

        const searchResults = await exa.searchAndContents(searchQuery, {
          numResults: 5,
          text: { maxCharacters: 2000 },
          useAutoprompt: true,
        });

        // Parse the search results to extract visa options
        const visaOptions: Record<string, VisaOptionDetails> = {};
        const extractedOptions = new Set<string>();

        for (const searchResult of searchResults.results) {
          const content = searchResult.text || "";

          // Extract visa types mentioned in content
          const visaTypePatterns = [
            /(?:Working Holiday|Youth Mobility|Work and Holiday)\s*(?:Visa|Scheme)?/gi,
            /(?:Skilled Worker|Skilled Migration|Skilled Employment)\s*(?:Visa)?/gi,
            /(?:Student|Study)\s*(?:Visa)?/gi,
            /(?:Investor|Business Innovation|Entrepreneur)\s*(?:Visa)?/gi,
            /(?:Family|Partner|Spouse)\s*(?:Visa)?/gi,
            /(?:Tourist|Visitor|Tourism)\s*(?:Visa)?/gi,
          ];

          for (const pattern of visaTypePatterns) {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach((match) => {
                const normalizedType = match
                  .replace(/\s*(Visa|Scheme)?\s*$/i, "")
                  .trim();
                extractedOptions.add(normalizedType);
              });
            }
          }
        }

        // Search for specific details about each visa type found
        for (const visaTypeName of Array.from(extractedOptions).slice(0, 4)) {
          const detailQuery = `${visaTypeName} visa ${originCountry} to ${destinationCountry} requirements cost processing time eligibility 2024 2025:`;

          const detailResults = await exa.searchAndContents(detailQuery, {
            numResults: 2,
            text: { maxCharacters: 1500 },
            useAutoprompt: true,
          });

          // Extract details from search results
          let ageReq = "Check eligibility";
          let duration = "Varies";
          let workRights = "Check conditions";
          let cost = "Check official fees";
          let processingTime = "Check current times";

          for (const detailResult of detailResults.results) {
            const text = detailResult.text || "";

            // Extract age requirements
            const ageMatch = text.match(
              /(?:age|aged?)\s*(?:between|from|:)?\s*(\d+)[\s-]+(?:to|and)?\s*(\d+)/i
            );
            if (ageMatch) {
              ageReq = `${ageMatch[1]}-${ageMatch[2]} years`;
            }

            // Extract duration
            const durationMatch = text.match(
              /(?:valid for|duration|period of|up to)\s*(\d+)\s*(year|month|week|day)s?/i
            );
            if (durationMatch) {
              duration = `Up to ${durationMatch[1]} ${durationMatch[2]}${parseInt(durationMatch[1]) > 1 ? "s" : ""}`;
            }

            // Extract cost
            const costMatch = text.match(
              /(?:fee|cost|price)[\s:]*(?:£|\$|€|AUD|CAD|USD|GBP)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i
            );
            if (costMatch) {
              cost = costMatch[0].replace(/fee|cost|price|:/gi, "").trim();
            }

            // Extract processing time
            const processMatch = text.match(
              /(?:processing time|takes?|process in)\s*(?:up to|approximately|about)?\s*(\d+)\s*(week|month|day)s?/i
            );
            if (processMatch) {
              processingTime = `${processMatch[1]} ${processMatch[2]}${parseInt(processMatch[1]) > 1 ? "s" : ""}`;
            }

            // Extract work rights
            if (/(?:can|allowed to|permitted to)\s*work/i.test(text)) {
              workRights = "Work permitted";
            } else if (
              /(?:cannot|not allowed to|prohibited from)\s*work/i.test(text)
            ) {
              workRights = "No work rights";
            } else if (/(?:limited|restricted)\s*work/i.test(text)) {
              const hoursMatch = text.match(
                /(\d+)\s*hours?\s*(?:per|\/)\s*week/i
              );
              if (hoursMatch) {
                workRights = `${hoursMatch[1]} hours/week`;
              } else {
                workRights = "Limited work rights";
              }
            }
          }

          visaOptions[visaTypeName] = {
            age: ageReq,
            duration: duration,
            work: workRights,
            cost: cost,
            processing: processingTime,
            requirement: visaTypeName.includes("Student")
              ? "University acceptance"
              : visaTypeName.includes("Skilled")
                ? "Job offer required"
                : visaTypeName.includes("Investor")
                  ? "Investment required"
                  : "Check eligibility",
          };
        }

        if (Object.keys(visaOptions).length > 0) {
          result = `As a ${originCountry} citizen moving to ${destinationCountry}, here are your visa options based on current official information:

${Object.entries(visaOptions)
  .map(
    ([type, details]) =>
      `**${type} Visa**:\n` +
      Object.entries(details)
        .map(([key, value]) => `  - ${key.replace(/_/g, " ")}: ${value}`)
        .join("\n")
  )
  .join("\n\n")}

These are the main visa options available. Would you like me to explain more details about a specific visa type or send you the requirements as a PDF?`;
        } else {
          // Fallback to GPT-4o if Exa doesn't return results
          result = await searchVisaWithGPT(originCountry, destinationCountry, visaType);
        }
      } else {
        // Search for detailed requirements for specific visa type
        const detailedQuery = `${visaType} visa ${originCountry} to ${destinationCountry} complete requirements documents checklist application process timeline fees 2024 2025 official:`;

        const searchResults = await exa.searchAndContents(detailedQuery, {
          numResults: 5,
          text: { maxCharacters: 3000 },
          useAutoprompt: true,
        });

        // Extract and parse requirements from search results
        const documents = new Set<string>();
        const processSteps = new Set<string>();
        let timeline = "Check official processing times";
        const costs: any = {};

        for (const searchResult of searchResults.results) {
          const content = searchResult.text || "";

          // Extract documents
          const docPatterns = [
            /passport/gi,
            /bank statement/gi,
            /police (?:clearance|certificate|check)/gi,
            /medical (?:exam|examination|certificate|check)/gi,
            /biometric/gi,
            /employment (?:letter|document|contract)/gi,
            /accommodation (?:proof|evidence|booking)/gi,
            /(?:proof|evidence) of funds/gi,
            /qualification|degree|transcript/gi,
            /english (?:language|proficiency) (?:test|certificate)/gi,
            /sponsor (?:letter|document)/gi,
            /insurance/gi,
          ];

          for (const pattern of docPatterns) {
            const matches = content.match(pattern);
            if (matches) {
              matches.forEach((match) => documents.add(match));
            }
          }

          // Extract process steps
          const stepPatterns = content.match(
            /(?:\d+[.\)]\s*)([^.!?\n]+(?:application|submit|pay|attend|complete|gather|book|wait|receive)[^.!?\n]+)/gi
          );
          if (stepPatterns) {
            stepPatterns.forEach((step) => {
              const cleanStep = step.replace(/^\d+[.\)]\s*/, "").trim();
              if (cleanStep.length > 10 && cleanStep.length < 100) {
                processSteps.add(cleanStep);
              }
            });
          }

          // Extract timeline
          const timelineMatch = content.match(
            /(?:processing time|takes?|process(?:ed)? (?:in|within))\s*(?:up to|approximately|about)?\s*(\d+)\s*(week|month|day)s?/i
          );
          if (timelineMatch) {
            timeline = `${timelineMatch[1]} ${timelineMatch[2]}${parseInt(timelineMatch[1]) > 1 ? "s" : ""} typically`;
          }

          // Extract costs
          const costPatterns = [
            {
              key: "application",
              pattern:
                /(?:application|visa) fee[\s:]*(?:£|\$|€|AUD|CAD|USD|GBP)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
            },
            {
              key: "health_surcharge",
              pattern:
                /health (?:surcharge|levy)[\s:]*(?:£|\$|€|AUD|CAD|USD|GBP)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
            },
            {
              key: "biometric",
              pattern:
                /biometric fee[\s:]*(?:£|\$|€|AUD|CAD|USD|GBP)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
            },
            {
              key: "priority_service",
              pattern:
                /priority (?:service|processing)[\s:]*(?:£|\$|€|AUD|CAD|USD|GBP)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i,
            },
          ];

          for (const { key, pattern } of costPatterns) {
            const match = content.match(pattern);
            if (match) {
              costs[key] = match[0]
                .replace(
                  /.*fee|.*surcharge|.*levy|.*service|.*processing|:/gi,
                  ""
                )
                .trim();
            }
          }
        }

        // Build the requirements object
        const requirements: VisaRequirements = VisaRequirementsSchema.parse({
          documents:
            Array.from(documents).length > 0
              ? Array.from(documents)
                  .slice(0, 10)
                  .map(
                    (doc) =>
                      doc.charAt(0).toUpperCase() + doc.slice(1).toLowerCase()
                  )
              : [
                  "Valid passport (6+ months validity)",
                  "Proof of funds",
                  "Application form",
                  "Supporting documents as per visa type",
                ],
          process:
            Array.from(processSteps).length > 0
              ? Array.from(processSteps)
                  .slice(0, 7)
                  .map(
                    (step, index) =>
                      `${index + 1}. ${step.charAt(0).toUpperCase() + step.slice(1)}`
                  )
              : [
                  "1. Check eligibility requirements",
                  "2. Gather required documents",
                  "3. Complete online application",
                  "4. Pay visa fees",
                  "5. Schedule appointment (if required)",
                  "6. Submit biometrics",
                  "7. Wait for decision",
                ],
          timeline: timeline,
          costs: {
            application: costs.application || "Check official website",
            health_surcharge: costs.health_surcharge || "If applicable",
            biometric: costs.biometric || "If required",
            priority_service:
              costs.priority_service || "Optional - faster processing",
          },
        });

        result = `For the ${visaType} visa from ${originCountry} to ${destinationCountry}:

**Required Documents:**
- ${requirements.documents.join("\n- ")}

**Application Process:**
${requirements.process.join("\n")}

**Timeline:** ${requirements.timeline}

**Costs Breakdown:**
- Application fee: ${requirements.costs.application}
- Health surcharge: ${requirements.costs.health_surcharge}
- Biometric fee: ${requirements.costs.biometric}
- Priority service: ${requirements.costs.priority_service}

*Note: This information is based on current official sources. Please verify with the official immigration website for the most up-to-date requirements.*

Would you like me to explain any specific requirement in more detail or send this information as a PDF?`;
      }

      // Store the result in conversation context
      await ctx.runMutation(internal.tools.visaRequirements.storeVisaSearchResult, {
        callId: args.callId,
        originCountry,
        destinationCountry,
        visaType,
        result,
        timestamp,
      });

      return result;
    } catch (error) {
      console.error("Error fetching visa requirements from Exa:", error);
      
      // Fallback to GPT-4o
      try {
        const result = await searchVisaWithGPT(originCountry, destinationCountry, visaType);
        
        // Store the result in conversation context
        await ctx.runMutation(internal.tools.visaRequirements.storeVisaSearchResult, {
          callId: args.callId,
          originCountry,
          destinationCountry,
          visaType,
          result,
          timestamp,
        });

        return result;
      } catch (gptError) {
        console.error("Error with GPT-4o fallback:", gptError);
        return `I encountered an issue while searching for visa information from ${originCountry} to ${destinationCountry}. Please try again later or consult the official immigration website.`;
      }
    }
  },
});

// Check if visa search should be triggered
export const shouldTriggerVisaSearch = internalAction({
  args: {
    callId: v.string(),
  },
  handler: async (ctx, args): Promise<string | null> => {
    // Get conversation context
    const conversation = await ctx.runQuery(internal.conversations.getConversationByCallId, {
      callId: args.callId,
    });

    if (!conversation || !conversation.extractedData) {
      return null;
    }

    const { originCountry, destinationCountry } = conversation.extractedData;

    // Check if we have both countries and haven't searched yet
    if (originCountry && destinationCountry) {
      // Check if we already have visa options stored
      const hasVisaOptions = conversation.extractedData.visaOptions;
      
      if (!hasVisaOptions) {
        // Trigger visa search automatically
        const result = await ctx.runAction(internal.tools.visaRequirements.getVisaRequirements, {
          callId: args.callId,
          originCountry,
          destinationCountry,
        });
        
        return result;
      }
    }

    return null;
  },
});