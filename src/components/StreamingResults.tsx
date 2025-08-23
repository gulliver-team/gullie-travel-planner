"use client";

import { useEffect, useState } from "react";
import { ResultCard } from "./ResultCard";
import { useStreamingSearch } from "@/hooks/useStreamingSearch";
import { EmailCaptureModal } from "./EmailCaptureModal";
import DecryptedText from "./DecryptedText";

interface StreamingResultsProps {
  userName: string;
  isSearching: boolean;
  isCallActive: boolean;
}

interface ResultData {
  type: string;
  visaType: string;
  timeline: string;
  totalCost: string;
  highlights?: string[];
}

export function StreamingResults({ 
  userName, 
  isCallActive 
}: StreamingResultsProps) {
  const { results, isLoading } = useStreamingSearch();
  const [selectedResult, setSelectedResult] = useState<ResultData | null>(null);

  useEffect(() => {
    if (isCallActive) {
      //TODO: Trigger search when user provides destination
      // This will be triggered by Vapi webhook or real-time events
    }
  }, [isCallActive]);

  return (
    <div className="space-y-12">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          Hi <span className="gradient-text">
            <DecryptedText
              text={userName}
              animateOn="view"
              speed={50}
              maxIterations={10}
              className="gradient-text"
              encryptedClassName="text-gray-600"
            />
          </span>
        </h1>
        <p className="text-xl text-gray-400">
          {isCallActive 
            ? "Speaking with Gullie Agent... Tell us your destination city"
            : "Click 'Start Voice Consultation' to begin your relocation consultation"}
        </p>
        {isCallActive && (
          <div className="flex items-center justify-center space-x-3 mt-4">
            <div className="relative">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-ping absolute"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
            <span className="text-sm text-green-500 font-medium">Call Active</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-8 space-y-4">
              <div className="h-6 bg-gray-800 rounded w-3/4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-800 rounded w-full animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse" />
                <div className="h-4 bg-gray-800 rounded w-4/6 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-300">
              Your Personalized Relocation Options
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Click on any option to get the full detailed report
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.find(r => r.type === "cheapest") && (
              <ResultCard
                title="Cheapest Option"
                type="cheapest"
                data={results.find(r => r.type === "cheapest")!}
                onSelect={setSelectedResult}
                isLocked={!selectedResult}
              />
            )}
            {results.find(r => r.type === "fastest") && (
              <ResultCard
                title="Fastest Option"
                type="fastest"
                data={results.find(r => r.type === "fastest")!}
                onSelect={setSelectedResult}
                isLocked={!selectedResult}
              />
            )}
            {results.find(r => r.type === "convenient") && (
              <ResultCard
                title="Most Convenient"
                type="convenient"
                data={results.find(r => r.type === "convenient")!}
                onSelect={setSelectedResult}
                isLocked={!selectedResult}
              />
            )}
            {results.find(r => r.type === "premium") && (
              <ResultCard
                title="Premium Option"
                type="premium"
                data={results.find(r => r.type === "premium")!}
                onSelect={setSelectedResult}
                isLocked={!selectedResult}
              />
            )}
          </div>
        </div>
      )}

      {/* Email Capture Modal */}
      {selectedResult && (
        <EmailCaptureModal
          result={selectedResult}
          userName={userName}
          onClose={() => setSelectedResult(null)}
        />
      )}

      {/* Footer */}
      <div className="text-center pt-8 border-t border-gray-800">
        <p className="text-xs text-gray-600">
          Real-time analysis powered by AI • Updated as you speak
        </p>
      </div>
    </div>
  );
}