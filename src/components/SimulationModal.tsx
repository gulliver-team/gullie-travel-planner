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
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  // const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  const streamSimulation = useAction(api.simulations.streamSimulation);
  const generateTimeline = useAction(api.simulations.generateTimeline);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      start_city: startCity,
      destination_city: destinationCity,
    }));
  }, [startCity, destinationCity]);


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
            className="bg-black border border-green-500/30 w-full max-w-[95vw] max-h-[90vh] relative overflow-hidden flex flex-col"
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

            <div className="p-6 flex-1 overflow-hidden flex flex-col">
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

              <div className="flex-1 overflow-hidden">
                <ComparisonTable 
                  scenarios={scenarios}
                  results={results}
                  timelines={timelines}
                  loadingStates={loadingStates}
                  context={formData.context}
                />
              </div>
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
  context: string;
}

function ComparisonTable({ 
  scenarios, 
  results, 
  timelines, 
  loadingStates,
  context
}: ComparisonTableProps) {
  const handleImmigrationPartnerClick = async (scenarioKey: string) => {
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'immigration_partner_introduction',
          scenarioKey,
          from: 'rachael@gullie.io',
          subject: 'Immigration Partner Introduction Request',
        }),
      });
      
      if (response.ok) {
        alert('Email introduction request sent! Our immigration partner will be in touch soon.');
      } else {
        alert('There was an issue sending the request. Please try again or contact support.');
      }
    } catch (error) {
      console.error('Error sending immigration partner request:', error);
      alert('There was an issue sending the request. Please try again or contact support.');
    }
  };

  // Function to determine relevant services based on user input
  const getRelevantServices = (context: string) => {
    const contextLower = context.toLowerCase();
    const services = [];

    // Always show cost and time
    services.push("cost", "time", "feasibility");

    // Immigration & Visa - always relevant for relocation
    services.push("immigration");

    // Long-term Housing - always relevant
    services.push("housing");

    // Pet Relocation - if pets are mentioned
    if (contextLower.includes('pet') || contextLower.includes('dog') || contextLower.includes('cat') || contextLower.includes('animal')) {
      services.push("pet");
    }

    // Banking & Finance - if financial services mentioned
    if (contextLower.includes('bank') || contextLower.includes('finance') || contextLower.includes('account') || contextLower.includes('credit')) {
      services.push("banking");
    }

    // Healthcare - if health/medical mentioned
    if (contextLower.includes('health') || contextLower.includes('medical') || contextLower.includes('doctor') || contextLower.includes('insurance')) {
      services.push("healthcare");
    }

    // Transportation - if car/transport mentioned
    if (contextLower.includes('car') || contextLower.includes('transport') || contextLower.includes('vehicle') || contextLower.includes('driving')) {
      services.push("transportation");
    }

    // Shipping & Storage - if belongings/furniture mentioned
    if (contextLower.includes('furniture') || contextLower.includes('belongings') || contextLower.includes('ship') || contextLower.includes('storage')) {
      services.push("shipping");
    }

    // Education for Kids - if family/children/school mentioned
    if (contextLower.includes('family') || contextLower.includes('child') || contextLower.includes('kid') || contextLower.includes('school') || contextLower.includes('education')) {
      services.push("education");
    }

    // Short-term Accommodation - if temporary housing mentioned
    if (contextLower.includes('temporary') || contextLower.includes('hotel') || contextLower.includes('short-term') || contextLower.includes('accommodation')) {
      services.push("accommodation");
    }

    // Tax & Accounting - if tax/business mentioned
    if (contextLower.includes('tax') || contextLower.includes('business') || contextLower.includes('accounting') || contextLower.includes('company')) {
      services.push("tax");
    }

    // SSN & Tax ID - if work/employment mentioned
    if (contextLower.includes('work') || contextLower.includes('job') || contextLower.includes('employ') || contextLower.includes('ssn') || contextLower.includes('tax id')) {
      services.push("ssn");
    }

    // Lifestyle - if lifestyle/culture mentioned
    if (contextLower.includes('lifestyle') || contextLower.includes('culture') || contextLower.includes('social') || contextLower.includes('community')) {
      services.push("lifestyle");
    }

    return services;
  };

  const allComparisonRows = [
    { 
      label: "Total Cost", 
      type: "cost",
      getValue: (timeline?: TimelineData) => 
        timeline?.budget_total_usd ? `$${timeline.budget_total_usd.toLocaleString()}` : "TBD",
      getDetails: (timeline?: TimelineData) => {
        if (!timeline?.phases) return null;
        const costs = timeline.phases.map(phase => 
          phase.tasks?.reduce((sum, task) => sum + (task.cost_usd || 0), 0) || 0
        );
        return costs.filter(cost => cost > 0).length > 0 ? 
          `Breakdown: ${costs.map((cost, i) => `Phase ${i+1}: $${cost.toLocaleString()}`).join(', ')}` : null;
      }
    },
    { 
      label: "Total Time", 
      type: "time",
      getValue: (timeline?: TimelineData) => 
        timeline?.timeframe_months ? `${timeline.timeframe_months} mo` : "TBD",
      getDetails: (timeline?: TimelineData) => {
        if (!timeline?.phases) return null;
        const phaseDetails = timeline.phases.map((phase, i) => 
          `Phase ${i+1}: ${phase.start_month || 0}-${phase.end_month || 0} mo`
        );
        return `Timeline: ${phaseDetails.join(' | ')}`;
      }
    },
    { 
      label: "Feasibility Score", 
      type: "score",
      getValue: (timeline?: TimelineData) => 
        timeline?.confidence ? `${Math.round(timeline.confidence * 10)}/10` : "TBD",
      getDetails: (timeline?: TimelineData) => {
        const score = timeline?.confidence ? Math.round(timeline.confidence * 10) : null;
        if (!score) return null;
        if (score >= 8) return "High feasibility - All requirements manageable";
        if (score >= 6) return "Moderate feasibility - Some challenges expected";
        return "Lower feasibility - Significant challenges likely";
      }
    },
    { 
      label: "Immigration & Visa", 
      type: "immigration",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const visaMatch = result.match(/visa[^.]*?([^.]*)/i);
        return visaMatch ? visaMatch[1].substring(0, 60).trim() : "Standard process";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const immigrationSection = sections.find(section => 
          section.toLowerCase().includes('visa') || section.toLowerCase().includes('immigration')
        );
        return immigrationSection ? immigrationSection.trim() : 
          "Documentation and legal requirements vary by destination";
      }
    },
    { 
      label: "Housing Strategy", 
      type: "housing",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const housingMatch = result.match(/housing[^.]*?([^.]*)/i);
        return housingMatch ? housingMatch[1].substring(0, 60).trim() : "Standard rental";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const housingSection = sections.find(section => 
          section.toLowerCase().includes('housing') || section.toLowerCase().includes('rental')
        );
        return housingSection ? housingSection.trim() : 
          "Rental market analysis and housing recommendations";
      }
    },
    { 
      label: "Pet Relocation", 
      type: "pet",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const petMatch = result.match(/pet[^.]*?([^.]*)/i);
        return petMatch ? petMatch[1].substring(0, 60).trim() : "Not specified";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const petSection = sections.find(section => 
          section.toLowerCase().includes('pet') || section.toLowerCase().includes('animal')
        );
        return petSection ? petSection.trim() : 
          "Pet import requirements and logistics";
      }
    },
    { 
      label: "Banking & Finance", 
      type: "banking",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const bankingMatch = result.match(/bank[^.]*?([^.]*)/i);
        return bankingMatch ? bankingMatch[1].substring(0, 60).trim() : "Standard banking setup";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const bankingSection = sections.find(section => 
          section.toLowerCase().includes('bank') || section.toLowerCase().includes('finance') || section.toLowerCase().includes('account')
        );
        return bankingSection ? bankingSection.trim() : 
          "Bank account setup and financial services";
      }
    },
    { 
      label: "Healthcare", 
      type: "healthcare",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const healthMatch = result.match(/health[^.]*?([^.]*)/i);
        return healthMatch ? healthMatch[1].substring(0, 60).trim() : "Health insurance setup";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const healthSection = sections.find(section => 
          section.toLowerCase().includes('health') || section.toLowerCase().includes('medical') || section.toLowerCase().includes('insurance')
        );
        return healthSection ? healthSection.trim() : 
          "Healthcare insurance and medical services setup";
      }
    },
    { 
      label: "Transportation", 
      type: "transportation",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const transportMatch = result.match(/transport[^.]*?([^.]*)/i);
        return transportMatch ? transportMatch[1].substring(0, 60).trim() : "Transportation setup";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const transportSection = sections.find(section => 
          section.toLowerCase().includes('transport') || section.toLowerCase().includes('car') || section.toLowerCase().includes('vehicle')
        );
        return transportSection ? transportSection.trim() : 
          "Vehicle registration and transportation setup";
      }
    },
    { 
      label: "Shipping & Storage", 
      type: "shipping",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const shippingMatch = result.match(/ship[^.]*?([^.]*)/i);
        return shippingMatch ? shippingMatch[1].substring(0, 60).trim() : "Shipping arrangements";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const shippingSection = sections.find(section => 
          section.toLowerCase().includes('ship') || section.toLowerCase().includes('storage') || section.toLowerCase().includes('belongings')
        );
        return shippingSection ? shippingSection.trim() : 
          "International shipping and storage solutions";
      }
    },
    { 
      label: "Education for Kids", 
      type: "education",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const educationMatch = result.match(/school[^.]*?([^.]*)/i);
        return educationMatch ? educationMatch[1].substring(0, 60).trim() : "School enrollment";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const educationSection = sections.find(section => 
          section.toLowerCase().includes('school') || section.toLowerCase().includes('education') || section.toLowerCase().includes('child')
        );
        return educationSection ? educationSection.trim() : 
          "School research and enrollment for children";
      }
    },
    { 
      label: "Short-term Accommodation", 
      type: "accommodation",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const accommMatch = result.match(/temporary[^.]*?([^.]*)/i);
        return accommMatch ? accommMatch[1].substring(0, 60).trim() : "Temporary housing";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const accommSection = sections.find(section => 
          section.toLowerCase().includes('temporary') || section.toLowerCase().includes('hotel') || section.toLowerCase().includes('accommodation')
        );
        return accommSection ? accommSection.trim() : 
          "Temporary accommodation while settling";
      }
    },
    { 
      label: "Tax & Accounting", 
      type: "tax",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const taxMatch = result.match(/tax[^.]*?([^.]*)/i);
        return taxMatch ? taxMatch[1].substring(0, 60).trim() : "Tax setup";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const taxSection = sections.find(section => 
          section.toLowerCase().includes('tax') || section.toLowerCase().includes('accounting') || section.toLowerCase().includes('business')
        );
        return taxSection ? taxSection.trim() : 
          "Tax registration and accounting setup";
      }
    },
    { 
      label: "SSN & Tax ID", 
      type: "ssn",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const ssnMatch = result.match(/ssn[^.]*?([^.]*)/i);
        return ssnMatch ? ssnMatch[1].substring(0, 60).trim() : "ID registration";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const ssnSection = sections.find(section => 
          section.toLowerCase().includes('ssn') || section.toLowerCase().includes('tax id') || section.toLowerCase().includes('social security')
        );
        return ssnSection ? ssnSection.trim() : 
          "Social Security Number and Tax ID application";
      }
    },
    { 
      label: "Lifestyle Services", 
      type: "lifestyle",
      getValue: (timeline?: TimelineData, result?: string) => {
        if (!result) return "TBD";
        const lifestyleMatch = result.match(/lifestyle[^.]*?([^.]*)/i);
        return lifestyleMatch ? lifestyleMatch[1].substring(0, 60).trim() : "Lifestyle integration";
      },
      getDetails: (timeline?: TimelineData, result?: string) => {
        if (!result) return null;
        const sections = result.split(/[#*]+/);
        const lifestyleSection = sections.find(section => 
          section.toLowerCase().includes('lifestyle') || section.toLowerCase().includes('culture') || section.toLowerCase().includes('social')
        );
        return lifestyleSection ? lifestyleSection.trim() : 
          "Cultural integration and lifestyle services";
      }
    }
  ];

  // Filter rows based on user input
  const comparisonRows = allComparisonRows.filter(row => 
    getRelevantServices(context).includes(row.type)
  );

  return (
    <div className="border border-green-500/30 bg-black h-full">
      <div className="overflow-x-auto overflow-y-auto h-full max-h-[60vh]">
        <div className="min-w-[800px]">
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
      {comparisonRows.map((row) => (
        <div key={row.label} className="grid grid-cols-5 border-b border-green-500/30 last:border-b-0 min-h-[100px]">
          <div className="p-4 bg-green-500/5 border-r border-green-500/30 font-medium text-gray-300 flex items-start">
            <div className="font-semibold text-sm">{row.label}</div>
          </div>
          {scenarios.map((scenario) => {
            const isLoading = loadingStates[scenario.key];
            const timeline = timelines[scenario.key];
            const result = results[scenario.key];
            const value = row.getValue(timeline, result);
            const details = row.getDetails ? row.getDetails(timeline, result) : null;

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
                  <div className="space-y-2">
                    <div className="font-semibold text-green-400 text-sm">{value}</div>
                    {details && (
                      <div className="text-xs text-gray-400 leading-relaxed">{details}</div>
                    )}
                    {row.type === 'immigration' && !isLoading && result && (
                      <button
                        onClick={() => handleImmigrationPartnerClick(scenario.key)}
                        className="mt-2 px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs hover:bg-green-500/20 hover:border-green-500 transition-all transform hover:scale-105 active:bg-green-500 active:text-black"
                      >
                        Connect me to immigration partner
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
        </div>
      </div>
    </div>
  );
}

