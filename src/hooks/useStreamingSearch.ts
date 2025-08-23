"use client";

import { useState, useCallback } from "react";
import { streamSearchResults } from "@/app/actions";

interface SearchResult {
  type: string;
  visaType: string;
  timeline: string;
  totalCost: string;
  highlights?: string[];
}

export function useStreamingSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const startSearch = useCallback(async (fromCity: string, toCity: string) => {
    setIsLoading(true);
    setResults([]);

    try {
      //TODO: Implement streaming with Vercel AI SDK
      // This will call the server action that uses streamUI
      await streamSearchResults(fromCity, toCity);
      
      // For now, simulate streaming results
      const mockResults = [
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

      // Simulate streaming
      for (const result of mockResults) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResults(prev => [...prev, result]);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    results,
    isLoading,
    startSearch
  };
}