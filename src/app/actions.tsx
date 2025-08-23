"use server";

import { createStreamableUI } from "@ai-sdk/rsc";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { signOut } from "@workos-inc/authkit-nextjs";

//TODO: Add OPENAI_API_KEY to .env.local
// Get from: https://platform.openai.com/api-keys

export async function signOutAction() {
  await signOut();
}

export async function streamSearchResults(fromCity: string, toCity: string) {
  const ui = createStreamableUI();
  
  // Start with loading state
  ui.update(
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {["cheapest", "fastest", "convenient", "premium"].map((type) => (
        <div key={type} className="card p-6 loading-pulse">
          <div className="h-4 bg-gray-800 rounded w-3/4 mb-4" />
          <div className="h-3 bg-gray-800 rounded w-full mb-2" />
          <div className="h-3 bg-gray-800 rounded w-5/6" />
        </div>
      ))}
    </div>
  );

  // Generate search results
  (async () => {
    try {
      //TODO: Replace with actual Exa search when API key is configured
      const prompt = `Analyze relocation options from ${fromCity} to ${toCity}. 
                      Provide 4 options: cheapest, fastest, most convenient, and premium.
                      For each, include visa type, timeline, and estimated total cost.
                      Format as JSON array with fields: type, visaType, timeline, totalCost, highlights`;

      const result = await generateText({
        model: openai("gpt-4o"),
        prompt,
      });

      // Parse and display results
      try {
        const options = JSON.parse(result.text);
        
        ui.done(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option: {type: string; visaType: string; timeline: string; totalCost: string; highlights?: string[]}) => (
              <div
                key={option.type}
                className={`card p-6 border ${getTypeColor(option.type)}`}
              >
                <h3 className={`font-bold text-lg mb-4 ${getTypeColor(option.type).split(" ")[0]}`}>
                  {getTitle(option.type)}
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Visa Type:</span>
                    <p className="font-semibold">{option.visaType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span>
                    <p className="font-semibold">{option.timeline}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Cost:</span>
                    <p className="font-semibold text-lg">{option.totalCost}</p>
                  </div>
                  {option.highlights && (
                    <ul className="space-y-1 text-xs text-gray-400">
                      {option.highlights.map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      } catch {
        // Fallback to mock data if parsing fails
        const mockOptions = [
          {
            type: "cheapest",
            visaType: "Working Holiday Visa",
            timeline: "3-4 weeks",
            totalCost: "£3,500",
            highlights: ["Budget airlines", "Shared accommodation", "DIY application"]
          },
          {
            type: "fastest",
            visaType: "Priority Skilled Worker",
            timeline: "5-7 days",
            totalCost: "£12,000",
            highlights: ["Express processing", "Premium flights", "Relocation service"]
          },
          {
            type: "convenient",
            visaType: "Standard Skilled Worker",
            timeline: "2-3 weeks",
            totalCost: "£7,500",
            highlights: ["Full service support", "Direct flights", "Temporary housing"]
          },
          {
            type: "premium",
            visaType: "Investor Visa",
            timeline: "1-2 weeks",
            totalCost: "£25,000",
            highlights: ["VIP processing", "Business class", "Luxury accommodation"]
          }
        ];

        ui.done(
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockOptions.map((option) => (
              <div
                key={option.type}
                className={`card p-6 border ${getTypeColor(option.type)}`}
              >
                <h3 className={`font-bold text-lg mb-4 ${getTypeColor(option.type).split(" ")[0]}`}>
                  {getTitle(option.type)}
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Visa Type:</span>
                    <p className="font-semibold">{option.visaType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Timeline:</span>
                    <p className="font-semibold">{option.timeline}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Cost:</span>
                    <p className="font-semibold text-lg">{option.totalCost}</p>
                  </div>
                  {option.highlights && (
                    <ul className="space-y-1 text-xs text-gray-400">
                      {option.highlights.map((item: string, i: number) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      }
    } catch {
      ui.error(
        <div className="text-red-500">
          Failed to generate search results. Please try again.
        </div>
      );
    }
  })();

  return ui.value;
}

function getTypeColor(type: string) {
  switch (type) {
    case "cheapest": return "text-green-400 border-green-400/30";
    case "fastest": return "text-blue-400 border-blue-400/30";
    case "convenient": return "text-purple-400 border-purple-400/30";
    case "premium": return "text-yellow-400 border-yellow-400/30";
    default: return "text-gray-400 border-gray-400/30";
  }
}

function getTitle(type: string) {
  switch (type) {
    case "cheapest": return "Cheapest Option";
    case "fastest": return "Fastest Option";
    case "convenient": return "Most Convenient";
    case "premium": return "Premium Option";
    default: return type;
  }
}