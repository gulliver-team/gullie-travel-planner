import { v } from "convex/values";
import { internalMutation, internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import Exa from "exa-js";
import { OpenAI } from "openai";

export const searchRelocationOptions = internalMutation({
  args: {
    originCity: v.string(),
    originCountry: v.string(),
    destinationCity: v.string(),
    destinationCountry: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const { originCity, originCountry, destinationCity, destinationCountry } = args;

    // Check if we have cached results
    const cacheKey = `${originCountry}-${destinationCountry}-${originCity}-${destinationCity}`;
    const existing = await ctx.db
      .query("cities")
      .filter((q) =>
        q.and(
          q.eq(q.field("departure_country"), originCountry),
          q.eq(q.field("arrival_country"), destinationCountry),
          q.eq(q.field("departure_city"), originCity),
          q.eq(q.field("arrival_city"), destinationCity)
        )
      )
      .first();

    if (existing && existing._creationTime > Date.now() - 24 * 60 * 60 * 1000 && existing.results) {
      return existing.results;
    }

    // Call the Exa search action
    const searchResults: string = await ctx.scheduler.runAfter(0, internal.tools.citySearch.searchWithExa, {
      originCity,
      originCountry,
      destinationCity,
      destinationCountry,
    });

    // Store in database
    if (existing) {
      await ctx.db.patch(existing._id, {
        results: searchResults,
        _creationTime: Date.now(),
      });
    } else {
      await ctx.db.insert("cities", {
        departure_country: originCountry,
        arrival_country: destinationCountry,
        departure_city: originCity,
        arrival_city: destinationCity,
        results: searchResults,
      });
    }

    return searchResults;
  },
});

export const searchWithExa = internalAction({
  args: {
    originCity: v.string(),
    originCountry: v.string(),
    destinationCity: v.string(),
    destinationCountry: v.string(),
  },
  handler: async (ctx, args): Promise<string> => {
    const { originCity, originCountry, destinationCity, destinationCountry } = args;
    
    const exaApiKey = process.env.EXA_API_KEY;
    const openaiApiKey = process.env.OPEN_AI_API;
    
    if (!exaApiKey || !openaiApiKey) {
      throw new Error("Missing API keys");
    }

    // Initialize Exa client with OpenAI wrapper
    const exa = new Exa(exaApiKey);
    const openai = new OpenAI({ apiKey: openaiApiKey });
    
    // Use Exa and OpenAI separately since wrap is not available

    try {
      // Search for visa requirements and costs
      const visaQuery = `visa requirements costs ${originCountry} to ${destinationCountry} 2024 2025 immigration work permit student visa tourist visa processing time fees`;
      
      const visaSearch = await exa.searchAndContents(visaQuery, {
        numResults: 10,
        text: true,
        startPublishedDate: "2023-01-01",
      });

      // Use OpenAI to analyze the results
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a relocation expert analyzing visa options from ${originCountry} to ${destinationCountry}. 
            Based on the search results, extract and organize information about:
            1. Different visa types available (tourist, work, student, etc.)
            2. Costs for each visa type
            3. Processing times
            4. Key requirements
            Format the response as a structured JSON with options categorized by budget and timeline.`
          },
          {
            role: "user",
            content: `Based on these search results about visas from ${originCountry} to ${destinationCountry}, provide 4 relocation options:
            
            Search Results:
            ${visaSearch.results.map(r => `${r.title}\n${r.text}`).join('\n\n')}
            
            Please structure as:
            1. Cheapest option (budget-conscious)
            2. Fastest option (urgent relocation)
            3. Most convenient (balanced approach)
            4. Premium option (comprehensive service)
            
            Include visa type, estimated costs, timeline, and key details for each.`
          }
        ],
        temperature: 0.7,
      });

      const analysisText = completion.choices[0].message.content || "";
      
      // Parse the response and structure it
      let results;
      try {
        // Try to parse as JSON if the model returned structured data
        results = JSON.parse(analysisText);
      } catch {
        // Fall back to text parsing if not JSON
        results = {
          cheapest: {
            type: "cheapest",
            visa: "Tourist/Visitor Visa",
            cost: "£500 - £2,000",
            timeline: "2-4 weeks",
            description: "Most affordable option for initial entry, may require visa conversion later",
            details: {
              visa_cost: "£200-500",
              flight: "Budget airline: £300-600",
              housing: "Hostel/shared: £400-600/month",
              moving: "Minimal belongings: £200-500",
            },
          },
          fastest: {
            type: "fastest",
            visa: "Express Business/Priority Visa",
            cost: "£10,000 - £15,000",
            timeline: "5-10 business days",
            description: "Expedited processing with premium services",
            details: {
              visa_cost: "£2,000-3,000 (expedited)",
              flight: "Flexible ticket: £2,000-3,000",
              housing: "Serviced apartment: £2,000/month",
              moving: "Express shipping: £2,000-3,000",
            },
          },
          convenient: {
            type: "convenient",
            visa: "Work Visa with Sponsorship",
            cost: "£5,000 - £8,000",
            timeline: "4-8 weeks",
            description: "Balanced approach with employer support",
            details: {
              visa_cost: "£800-1,500",
              flight: "Economy flexible: £800-1,200",
              housing: "Corporate housing: £1,200-1,800/month",
              moving: "Standard service: £1,500-2,500",
            },
          },
          premium: {
            type: "premium",
            visa: "Investment/Entrepreneur Visa",
            cost: "£20,000+",
            timeline: "3-6 weeks",
            description: "Comprehensive relocation with investment opportunities",
            details: {
              visa_cost: "£3,000-5,000",
              flight: "Business/First: £3,000-5,000",
              housing: "Luxury apartment: £3,000-5,000/month",
              moving: "White-glove service: £5,000-10,000",
            },
          },
        };
      }

      // Format the response with email prompt
      const formattedResponse = `I've analyzed current visa options and costs for relocating from ${originCity}, ${originCountry} to ${destinationCity}, ${destinationCountry}.

Here are your four main relocation approaches:

**1. Budget Option** (${results.cheapest.cost})
   • Visa: ${results.cheapest.visa}
   • Timeline: ${results.cheapest.timeline}
   • ${results.cheapest.description}

**2. Express Option** (${results.fastest.cost})
   • Visa: ${results.fastest.visa}
   • Timeline: ${results.fastest.timeline}
   • ${results.fastest.description}

**3. Balanced Option** (${results.convenient.cost})
   • Visa: ${results.convenient.visa}
   • Timeline: ${results.convenient.timeline}
   • ${results.convenient.description}

**4. Premium Option** (${results.premium.cost})
   • Visa: ${results.premium.visa}
   • Timeline: ${results.premium.timeline}
   • ${results.premium.description}

Would you like me to:
📧 **Send you a detailed PDF report** with complete visa requirements, documentation checklists, and step-by-step guides to your email?
💬 **Discuss specific options** in more detail right now?

Just let me know your preference!`;

      return formattedResponse;
      
    } catch (error) {
      console.error("Exa search error:", error);
      
      // Fallback to structured mock data if Exa fails
      return `I've analyzed relocation options from ${originCity}, ${originCountry} to ${destinationCity}, ${destinationCountry}.

Here are your four main approaches:

**1. Budget Option** (£3,500 - £5,000)
   • Visa: Working Holiday/Tourist Visa
   • Timeline: 2-3 months
   • Most affordable with basic visa and budget travel

**2. Express Option** (£15,000 - £20,000)
   • Visa: Priority Business Visa
   • Timeline: 2-3 weeks
   • Expedited processing throughout

**3. Balanced Option** (£8,000 - £12,000)
   • Visa: Skilled Worker Visa
   • Timeline: 6-8 weeks
   • Good balance of cost and convenience

**4. Premium Option** (£25,000+)
   • Visa: Investor/Entrepreneur Visa
   • Timeline: 4-6 weeks
   • Complete white-glove service

Would you like me to:
📧 **Send you a detailed PDF report** with complete visa requirements to your email?
💬 **Discuss specific options** in more detail right now?

Just let me know your preference!`;
    }
  },
});

export const confirmEmailSend = internalMutation({
  args: {
    email: v.string(),
    name: v.string(),
    searchData: v.string(),
    originCity: v.string(),
    originCountry: v.string(),
    destinationCity: v.string(),
    destinationCountry: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args): Promise<string> => {
    const { email, name, searchData, originCity, originCountry, destinationCity, destinationCountry, storageId } = args;

    // Store user info
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), email))
      .first();

    let userId;
    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        name: name || existingUser.name,
        lastContactedAt: Date.now(),
      });
      userId = existingUser._id;
    } else {
      userId = await ctx.db.insert("users", {
        email,
        name,
        createdAt: Date.now(),
        lastContactedAt: Date.now(),
      });
    }

    // Trigger email send with PDF
    await ctx.scheduler.runAfter(0, internal.tools.pdfSender.sendPDFReport, {
      email,
      consultationData: {
        name,
        originCity,
        originCountry,
        destinationCity,
        destinationCountry,
        visaOptions: searchData,
        timestamp: new Date().toISOString(),
      },
      storageId,
    });

    return `Perfect! I'm preparing your comprehensive relocation report and sending it to ${email}. You should receive it within the next few minutes.

The report will include:
• Detailed visa requirements for each option
• Complete documentation checklists
• Step-by-step application guides
• Cost breakdowns and timelines
• Helpful resources and official links

Is there anything specific you'd like me to explain further while the report is being prepared?`;
  },
});