"use client";

interface ResultData {
  type: string;
  visaType: string;
  timeline: string;
  totalCost: string;
  highlights?: string[];
}

interface ResultCardProps {
  title: string;
  type: "cheapest" | "fastest" | "convenient" | "premium";
  data: ResultData;
  onSelect: (data: ResultData) => void;
  isLocked: boolean;
}

export function ResultCard({ title, type, data, onSelect, isLocked }: ResultCardProps) {
  const getTypeStyles = () => {
    switch (type) {
      case "cheapest": 
        return {
          color: "text-green-400",
          border: "border-green-400/30",
          hover: "hover:border-green-400/60",
          icon: "💰"
        };
      case "fastest": 
        return {
          color: "text-blue-400",
          border: "border-blue-400/30",
          hover: "hover:border-blue-400/60",
          icon: "⚡"
        };
      case "convenient": 
        return {
          color: "text-purple-400",
          border: "border-purple-400/30",
          hover: "hover:border-purple-400/60",
          icon: "✨"
        };
      case "premium": 
        return {
          color: "text-yellow-400",
          border: "border-yellow-400/30",
          hover: "hover:border-yellow-400/60",
          icon: "👑"
        };
      default: 
        return {
          color: "text-gray-400",
          border: "border-gray-400/30",
          hover: "hover:border-gray-400/60",
          icon: "📋"
        };
    }
  };

  const styles = getTypeStyles();

  if (!data) {
    return (
      <div className={`card p-8 border-2 ${styles.border} opacity-50`}>
        <div className="flex items-start justify-between mb-6">
          <h3 className={`font-bold text-xl ${styles.color}`}>
            {title}
          </h3>
          <span className="text-2xl opacity-50">{styles.icon}</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-800 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`card p-8 border-2 cursor-pointer transition-all transform ${styles.border} ${styles.hover} ${
        !isLocked ? "hover:scale-105 hover:shadow-2xl" : ""
      }`}
      onClick={() => !isLocked && onSelect(data)}
    >
      <div className="flex items-start justify-between mb-6">
        <h3 className={`font-bold text-xl ${styles.color}`}>
          {title}
        </h3>
        <span className="text-2xl">{styles.icon}</span>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Visa Type</span>
          <p className="font-semibold text-lg">{data.visaType || "Loading..."}</p>
        </div>
        
        <div className="space-y-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Timeline</span>
          <p className="font-semibold">{data.timeline || "Loading..."}</p>
        </div>
        
        <div className="space-y-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider">Total Cost</span>
          <p className="font-bold text-2xl">
            {isLocked ? (
              <span className="blur-sm select-none">£XX,XXX</span>
            ) : (
              data.totalCost || "Calculating..."
            )}
          </p>
        </div>

        {data.highlights && data.highlights.length > 0 && (
          <div className="pt-4 border-t border-gray-800">
            <ul className="space-y-2">
              {data.highlights.slice(0, 3).map((item: string, i: number) => (
                <li key={i} className="flex items-start space-x-2 text-sm text-gray-400">
                  <span className="text-green-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {!isLocked && (
        <button className={`mt-6 w-full py-3 border-2 ${styles.border} ${styles.color} text-sm font-bold uppercase tracking-wider hover:bg-white/5 transition-all`}>
          View Full Details →
        </button>
      )}
    </div>
  );
}