"use client";

import { useVapi } from "@/providers/VapiProvider";
import { useEffect, useState } from "react";

interface VapiConversationIndicatorProps {
  showAlways?: boolean; // Show even when call is not active
}

export function VapiConversationIndicator({ showAlways = false }: VapiConversationIndicatorProps = {}) {
  const { isCallActive, isSpeaking, transcript } = useVapi();
  const [pulseAnimation, setPulseAnimation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (isSpeaking) {
      setPulseAnimation(true);
      const timer = setTimeout(() => setPulseAnimation(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isSpeaking]);

  useEffect(() => {
    setIsExpanded(isCallActive);
  }, [isCallActive]);

  // Only hide if not showAlways and call is not active
  if (!showAlways && !isCallActive) return null;

  const lastTranscript = transcript[transcript.length - 1];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        {/* Main conversation card - transitions between small square and full size */}
        <div 
          className={`bg-black border border-green-500/30 flex flex-col transition-all duration-500 ease-in-out ${
            isExpanded 
              ? 'w-[400px] h-[420px] p-6' 
              : 'w-[80px] h-[80px] p-4 cursor-pointer hover:scale-105'
          }`}
          onClick={() => !isExpanded && setIsExpanded(true)}
        >
          {isExpanded ? (
            <>
              {/* Expanded view - Full conversation interface */}
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Animated microphone icon */}
                  <div className="relative">
                    <div className={`absolute inset-0 bg-green-500/20 ${pulseAnimation ? 'animate-ping' : ''}`}></div>
                    <div className="relative w-12 h-12 bg-green-500/10 border border-green-500 flex items-center justify-center">
                      <svg 
                        className={`w-6 h-6 ${isSpeaking ? 'text-green-500' : 'text-green-400'}`}
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-green-500 font-bold text-sm uppercase tracking-wider">
                      Gullie Agent
                    </h3>
                    <p className="text-xs text-gray-500">
                      {!isCallActive ? "Ready to connect" : isSpeaking ? "Speaking..." : "Listening..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isCallActive ? (
                    <>
                      <div className="relative">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                      </div>
                      <span className="text-xs text-green-500 font-medium">LIVE</span>
                    </>
                  ) : (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsExpanded(false);
                        }}
                        className="text-gray-500 hover:text-green-500 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Audio visualization */}
              <div className="mb-4 flex-shrink-0">
                <div className="flex items-center justify-center gap-1 h-16">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className={`bg-green-500 transition-all duration-150 ${
                        isSpeaking 
                          ? 'animate-pulse' 
                          : 'opacity-30'
                      }`}
                      style={{
                        width: '3px',
                        height: isSpeaking 
                          ? `${Math.random() * 100}%` 
                          : '20%',
                        animationDelay: `${i * 50}ms`,
                        transform: isSpeaking ? 'scaleY(1)' : 'scaleY(0.3)',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Latest transcript */}
              <div className="border-t border-green-500/20 pt-4 flex-1 overflow-hidden">
                {lastTranscript ? (
                  <>
                    <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">
                      {lastTranscript.role === 'user' ? 'You' : 'Agent'}:
                    </p>
                    <div className="overflow-y-auto max-h-[100px] scrollbar-thin">
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {lastTranscript.text}
                      </p>
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Waiting for conversation...
                  </p>
                )}
              </div>

              {/* Instructions */}
              <div className="mt-4 pt-4 border-t border-green-500/20 flex-shrink-0">
                <p className="text-xs text-gray-600">
                  {isCallActive 
                    ? "Speak naturally to provide your destination city"
                    : "Voice assistant ready - Start a consultation to begin"}
                </p>
              </div>
            </>
          ) : (
            /* Collapsed view - Small square with pulsing icon */
            <div className="flex items-center justify-center w-full h-full">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 animate-ping"></div>
                <svg 
                  className="w-8 h-8 text-green-500 relative z-10"
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Electric glow effect - only when expanded */}
        {isExpanded && (
          <div 
            className="absolute inset-0 bg-green-500/5 blur-xl -z-10 transition-opacity duration-500"
            style={{
              filter: 'blur(40px)',
              transform: 'scale(1.2)'
            }}
          />
        )}
      </div>
    </div>
  );
}