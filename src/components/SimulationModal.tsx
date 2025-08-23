"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  startCity?: string;
  destinationCity?: string;
}

const scenarios = [
  { key: "cheapest" as const, label: "Cheapest Option" },
  { key: "fastest" as const, label: "Fastest Option" },
  { key: "balanced" as const, label: "Balanced Option" },
  { key: "luxury" as const, label: "Luxury Option" },
];

const loadingPhrases = [
  "Analyzing the unique cultural fabric and social atmosphere of each district",
  "Aggregating and cross-referencing thousands of current rental market listings",
  "Simulating daily commute routes via public transit, driving, and cycling options",
  "Evaluating curriculum standards and admission availability at international schools",
  "Calculating a detailed, personalized cost of living index against your income",
  "Investigating and outlining the most viable long-term visa and residency pathways",
  "Scoring local coworking spaces based on amenities, community reviews, and pricing",
  "Correlating official crime statistics with hyperlocal resident safety sentiment data",
  "Pinpointing public parks, nature reserves, and recreational green spaces nearby",
  "Identifying popular and hidden-gem destinations for enriching weekend excursions",
];

export function SimulationModal({
  isOpen,
  onClose,
  startCity = "",
  destinationCity = "",
}: SimulationModalProps) {
  const [formData, setFormData] = useState({
    start_city: startCity,
    destination_city: destinationCity,
    budget_min: "",
    budget_max: "",
    move_month: "",
    context: "",
  });

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<Record<string, string>>({});
  const [timelines, setTimelines] = useState<Record<string, TimelineData>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );
  const [currentPhrases, setCurrentPhrases] = useState<Record<string, string>>(
    {}
  );
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);

  const streamSimulation = useAction(api.simulations.streamSimulation);
  const generateTimeline = useAction(api.simulations.generateTimeline);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      start_city: startCity,
      destination_city: destinationCity,
    }));
  }, [startCity, destinationCity]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setCurrentPhrases((prev) => {
        const newPhrases = { ...prev };
        scenarios.forEach((scenario) => {
          if (loadingStates[scenario.key]) {
            newPhrases[scenario.key] =
              loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)];
          }
        });
        return newPhrases;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isRunning, loadingStates]);

  const formatBudgetRange = () => {
    const min = formData.budget_min ? Number(formData.budget_min) : null;
    const max = formData.budget_max ? Number(formData.budget_max) : null;

    if (min && max && max >= min) {
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    } else if (min) {
      return `Over $${min.toLocaleString()}`;
    } else if (max) {
      return `Under $${max.toLocaleString()}`;
    }
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);
    setIsFormCollapsed(true);
    setResults({});
    setTimelines({});
    setExpandedScenario(null);

    const budgetRange = formatBudgetRange();

    // Initialize loading states
    const initialLoadingStates: Record<string, boolean> = {};
    scenarios.forEach((s) => {
      initialLoadingStates[s.key] = true;
    });
    setLoadingStates(initialLoadingStates);

    // Run all scenarios in parallel
    const promises = scenarios.map(async (scenario) => {
      try {
        const result = await streamSimulation({
          start_city: formData.start_city,
          destination_city: formData.destination_city,
          budget_range: budgetRange,
          move_month: formData.move_month,
          context: formData.context,
          scenario: scenario.key,
        });

        setResults((prev) => ({ ...prev, [scenario.key]: result }));
        setLoadingStates((prev) => ({ ...prev, [scenario.key]: false }));

        // Generate timeline
        const timeline = await generateTimeline({
          scenario_key: scenario.key,
          scenario_title: scenario.label,
          raw_text: result.slice(0, 15000),
        });

        setTimelines((prev) => ({ ...prev, [scenario.key]: timeline }));
      } catch (error) {
        console.error(`Error in ${scenario.key}:`, error);
        setResults((prev) => ({
          ...prev,
          [scenario.key]: `Error: ${error}`,
        }));
        setLoadingStates((prev) => ({ ...prev, [scenario.key]: false }));
      }
    });

    await Promise.all(promises);
    setIsRunning(false);
  };

  const handleClear = () => {
    setFormData({
      start_city: startCity,
      destination_city: destinationCity,
      budget_min: "",
      budget_max: "",
      move_month: "",
      context: "",
    });
    setResults({});
    setTimelines({});
    setExpandedScenario(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black border border-green-500/30 w-full max-w-[90vw] max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: "0 0 40px rgba(0, 255, 0, 0.1)",
            }}
          >
            <div className="sticky top-0 bg-black border-b border-green-500/30 p-6 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-green-500 tracking-wider">
                  RELOCATION SIMULATIONS
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-green-500 transition-colors transform hover:scale-110"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="mb-8">
                {/* Form header with collapse toggle */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm text-gray-500 uppercase tracking-wider">
                    Simulation Parameters
                  </h3>
                  {(isRunning || Object.keys(results).length > 0) && (
                    <button
                      type="button"
                      onClick={() => setIsFormCollapsed(!isFormCollapsed)}
                      className="text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${
                          isFormCollapsed ? "" : "rotate-180"
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
                
                <AnimatePresence>
                  {!isFormCollapsed && (
                    <motion.div
                      initial={{ height: "auto", opacity: 1 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className=""
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Start City
                    </label>
                    <input
                      type="text"
                      value={formData.start_city}
                      onChange={(e) =>
                        setFormData({ ...formData, start_city: e.target.value })
                      }
                      placeholder="San Francisco, CA, USA"
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-green-500 placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all transform hover:scale-x-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Destination City
                    </label>
                    <input
                      type="text"
                      value={formData.destination_city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          destination_city: e.target.value,
                        })
                      }
                      placeholder="Lisbon, Portugal"
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-green-500 placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all transform hover:scale-x-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Min Budget (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) =>
                        setFormData({ ...formData, budget_min: e.target.value })
                      }
                      placeholder="25000"
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-green-500 placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all transform hover:scale-x-[1.02]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Max Budget (USD)
                    </label>
                    <input
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) =>
                        setFormData({ ...formData, budget_max: e.target.value })
                      }
                      placeholder="50000"
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-green-500 placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all transform hover:scale-x-[1.02]"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Ideal Move Month
                    </label>
                    <input
                      type="month"
                      value={formData.move_month}
                      onChange={(e) =>
                        setFormData({ ...formData, move_month: e.target.value })
                      }
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-green-500 placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all transform hover:scale-x-[1.02]"
                    />
                  </div>

                  <div className="space-y-2 lg:col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-wider">
                      Additional Context
                    </label>
                    <textarea
                      value={formData.context}
                      onChange={(e) =>
                        setFormData({ ...formData, context: e.target.value })
                      }
                      placeholder="e.g., family with dog, school priority, job details, constraints"
                      rows={3}
                      className="w-full bg-black border border-green-500/30 px-3 py-2 text-green-500 placeholder-gray-600 focus:border-green-500 focus:outline-none transition-all transform hover:scale-x-[1.02] resize-none"
                    />
                  </div>
                </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-6 py-2 border border-green-500/30 text-gray-500 hover:text-green-500 hover:border-green-500 transition-all transform hover:scale-x-105 hover:scale-y-105 active:bg-green-500 active:text-black"
                  >
                    Clear
                  </button>
                  <button
                    type="submit"
                    disabled={isRunning}
                    className="px-6 py-2 bg-green-500/10 border border-green-500 text-green-500 hover:bg-green-500/20 transition-all transform hover:scale-x-105 hover:scale-y-105 active:bg-green-500 active:text-black disabled:opacity-50 disabled:cursor-not-allowed relative"
                  >
                    {isRunning ? (
                      <span className="flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-green-500 border-t-transparent animate-spin"></span>
                        Streaming...
                      </span>
                    ) : (
                      "Run 4 Scenarios"
                    )}
                  </button>
                </div>
              </form>

              <ComparisonTable 
                scenarios={scenarios}
                results={results}
                timelines={timelines}
                loadingStates={loadingStates}
                currentPhrases={currentPhrases}
              />


            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface TimelineTask {
  title: string;
  desc?: string;
  cost_usd?: number;
  duration_weeks?: number;
  milestone?: boolean;
}

interface TimelinePhase {
  name: string;
  start_month?: number;
  end_month?: number;
  summary?: string;
  tasks?: TimelineTask[];
}

interface TimelineData {
  headline?: string;
  budget_total_usd?: number;
  timeframe_months?: number;
  phases?: TimelinePhase[];
  milestones?: Array<{ title: string; month: number; note: string }>;
  notes?: string;
  confidence?: number;
}

interface ComparisonTableProps {
  scenarios: { key: string; label: string }[];
  results: Record<string, string>;
  timelines: Record<string, TimelineData>;
  loadingStates: Record<string, boolean>;
  currentPhrases: Record<string, string>;
}

function ComparisonTable({ 
  scenarios, 
  results, 
  timelines, 
  loadingStates, 
  currentPhrases 
}: ComparisonTableProps) {
  const comparisonRows = [
    { 
      label: "Total Cost", 
      getValue: (timeline?: TimelineData) => 
        timeline?.budget_total_usd ? `$${timeline.budget_total_usd.toLocaleString()}` : "TBD"
    },
    { 
      label: "Total Time", 
      getValue: (timeline?: TimelineData) => 
        timeline?.timeframe_months ? `${timeline.timeframe_months} mo` : "TBD"
    },
    { 
      label: "Feasibility Score", 
      getValue: (timeline?: TimelineData) => 
        timeline?.confidence ? `${Math.round(timeline.confidence * 10)}/10` : "TBD"
    },
    { 
      label: "Visa Requirements", 
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        // Extract visa info from result text
        const visaMatch = result.match(/visa[^.]*?([A-Z][^.]*)/i);
        return visaMatch ? visaMatch[1].substring(0, 50) + "..." : "Standard process";
      }
    },
    { 
      label: "Housing Strategy", 
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        // Extract housing info from result text
        const housingMatch = result.match(/housing[^.]*?([A-Z][^.]*)/i);
        return housingMatch ? housingMatch[1].substring(0, 50) + "..." : "Standard rental";
      }
    },
    { 
      label: "Pet Relocation", 
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        // Extract pet info from result text
        const petMatch = result.match(/pet[^.]*?([A-Z][^.]*)/i);
        return petMatch ? petMatch[1].substring(0, 50) + "..." : "Not specified";
      }
    },
    { 
      label: "Key Phases", 
      getValue: (timeline?: TimelineData) => 
        timeline?.phases ? `${timeline.phases.length} phases` : "TBD"
    }
  ];

  return (
    <div className="border border-green-500/30 bg-black overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-5 border-b border-green-500/30">
        <div className="p-4 bg-green-500/10 border-r border-green-500/30">
          <span className="text-sm font-bold text-green-500 uppercase tracking-wider">
            Comparison
          </span>
        </div>
        {scenarios.map((scenario) => (
          <div key={scenario.key} className="p-4 bg-green-500/10 border-r border-green-500/30 last:border-r-0">
            <span className="text-sm font-bold text-green-500 uppercase tracking-wider">
              {scenario.label}
            </span>
          </div>
        ))}
      </div>

      {/* Data Rows */}
      {comparisonRows.map((row, rowIndex) => (
        <div key={row.label} className="grid grid-cols-5 border-b border-green-500/30 last:border-b-0">
          <div className="p-4 bg-green-500/5 border-r border-green-500/30 font-medium text-gray-300">
            {row.label}
          </div>
          {scenarios.map((scenario) => {
            const isLoading = loadingStates[scenario.key];
            const timeline = timelines[scenario.key];
            const result = results[scenario.key];
            const value = row.getValue(timeline, result);

            return (
              <div key={scenario.key} className="p-4 border-r border-green-500/30 last:border-r-0 text-gray-300">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className="w-1 h-3 bg-green-500/50 animate-bounce"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-gray-500">Loading...</span>
                  </div>
                ) : (
                  <span className="text-sm">{value}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface ScenarioCardProps {
  scenario: { key: string; label: string };
  result?: string;
  timeline?: TimelineData;
  isLoading?: boolean;
  loadingPhrase?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

function ScenarioCard({
  scenario,
  result,
  timeline,
  isLoading,
  loadingPhrase,
  isExpanded,
  onToggleExpand,
}: ScenarioCardProps) {
  const showInitialAnimation = !result;
  
  return (
    <motion.div
      className="bg-black border border-green-500/30 p-4 relative"
      initial={showInitialAnimation ? { opacity: 0, y: 20 } : false}
      animate={showInitialAnimation ? { opacity: 1, y: 0 } : false}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10">
        <div className="items-center flex justify-between mb-4">
          <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider">
            {scenario.label}
          </h3>
          {result && (
            <button
              onClick={onToggleExpand}
              className="text-gray-500 hover:text-green-500 transition-colors transform hover:scale-110"
            >
              <svg
                className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          )}
        </div>

        <div className={`${isExpanded ? "" : "min-h-[100px] max-h-[300px]"} overflow-y-auto transition-all duration-300`}>
          {isLoading ? (
            <div className="text-gray-500 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex gap-1">
                  {[...Array(3)].map((_, i) => (
                    <span
                      key={i}
                      className="w-1 h-3 bg-green-500/50 animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  ))}
                </span>
                <span className="text-xs">{loadingPhrase}</span>
              </div>
            </div>
          ) : result ? (
            <div className="space-y-4">
              {timeline && (
                <div className="flex gap-2 mb-4">
                  {timeline.budget_total_usd && (
                    <span className="inline-flex max-h-10 items-center gap-1 px-3 py-1 bg-green-500 text-black text-xs font-bold">
                      <span>Budget</span>
                      <span>${timeline.budget_total_usd.toLocaleString()}</span>
                    </span>
                  )}
                  {timeline.timeframe_months && (
                    <span className="inline-flex max-h-10 items-center gap-1 px-3 py-1 bg-green-500 text-black text-xs font-bold">
                      <span>Timeframe</span>
                      <span>{timeline.timeframe_months}mo</span>
                    </span>
                  )}
                </div>
              )}

              {!isExpanded && timeline?.phases && (
                  <div className="border-t border-green-500/20 pt-4">
                    <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Timeline Breakdown
                    </h4>
                    <div className="space-y-3">
                  {timeline.phases.map((phase, i) => (
                    <div
                      key={i}
                      className="bg-white/5 border border-green-500/20 p-3"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold text-green-500">
                          {phase.name}
                        </span>
                        {(phase.start_month !== undefined ||
                          phase.end_month !== undefined) && (
                          <span className="text-xs text-gray-500">
                            {phase.start_month ?? 0}–{phase.end_month ?? ""}{" "}
                            mo
                          </span>
                        )}
                      </div>
                      {phase.summary && (
                        <p className="text-xs text-gray-400 mb-2">
                          {phase.summary}
                        </p>
                      )}
                      {phase.tasks && phase.tasks.length > 0 && (
                        <div className="space-y-2">
                          {phase.tasks.map((task, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <div
                                className={`w-2 h-2 mt-1 ${
                                  task.milestone
                                    ? "bg-green-500"
                                    : "bg-gray-600"
                                }`}
                              />
                              <div className="flex-1">
                                <div className="text-xs text-gray-300">
                                  {task.title}
                                </div>
                                {task.desc && (
                                  <div className="text-xs text-gray-500">
                                    {task.desc}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-1">
                                  {task.cost_usd && (
                                    <span className="text-xs text-gray-600 border border-gray-700 px-1">
                                      ${task.cost_usd.toLocaleString()}
                                    </span>
                                  )}
                                  {task.duration_weeks && (
                                    <span className="text-xs text-gray-600 border border-gray-700 px-1">
                                      {task.duration_weeks} wk
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                    </div>
                  </div>
                )}

              {/* <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4"
                  >
                    <div className="text-sm text-gray-300 font-mono mb-4">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-lg font-bold text-green-500 mb-2 mt-4">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-md font-bold text-green-500 mb-2 mt-3">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-sm font-bold text-green-500 mb-1 mt-2">{children}</h3>,
                          p: ({ children }) => <p className="text-gray-300 mb-2">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc list-inside mb-2 text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                          code: ({ children }) => <code className="bg-green-500/10 text-green-400 px-1 py-0.5">{children}</code>,
                          pre: ({ children }) => <pre className="bg-green-500/10 text-green-400 p-2 mb-2 overflow-x-auto">{children}</pre>,
                          blockquote: ({ children }) => <blockquote className="border-l-2 border-green-500 pl-3 text-gray-400 italic mb-2">{children}</blockquote>,
                          strong: ({ children }) => <strong className="font-bold text-green-400">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                          hr: () => <hr className="border-green-500/30 my-4" />,
                          a: ({ href, children }) => <a href={href} className="text-green-400 underline hover:text-green-300" target="_blank" rel="noopener noreferrer">{children}</a>
                        }}
                      >
                        {result}
                      </ReactMarkdown>
                    </div>
                  
                  </motion.div>
                )}
              </AnimatePresence> */}
            </div>
          ) : (
            <div className="text-gray-600 text-sm">Ready to simulate...</div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
