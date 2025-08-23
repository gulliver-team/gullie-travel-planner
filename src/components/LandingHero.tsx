"use client";

import { VapiConversationIndicator } from "./VapiConversationIndicator";
import { useVapi } from "@/providers/VapiProvider";
import DecryptedText from "./DecryptedText";

interface LandingHeroProps {
  userName: string;
  setUserName: (name: string) => void;
  onStart: () => void;
  isLoading?: boolean;
}

export function LandingHero({
  userName,
  setUserName,
  onStart,
  isLoading,
}: LandingHeroProps) {
  const { startCall, endCall, isCallActive } = useVapi();

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-10">
        {/* Header Section */}
        <div className="text-center flex flex-col items-center space-y-6">
          <h1 className="text-7xl md:text-8xl font-bold">
            <DecryptedText
              text="GULLIE"
              animateOn="view"
              speed={80}
              maxIterations={15}
              characters="G0UL1L3IE#@$%"
              className="gradient-text"
              encryptedClassName="text-gray-600"
              parentClassName="animate-pulse"
            />
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300">
            <DecryptedText
              text="Your AI Global Mobility Expert"
              animateOn="view"
              speed={30}
              sequential={true}
              revealDirection="center"
              className="text-gray-300"
              encryptedClassName="text-gray-700"
            />
          </p>
          <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mt-4">
            <DecryptedText
              text="Navigate global relocation with confidence. Get personalized visa guidance, flight options, housing solutions, and comprehensive support."
              animateOn="view"
              speed={20}
              sequential={true}
              revealDirection="start"
              className="text-gray-400"
              encryptedClassName="text-gray-800"
            />
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full max-w-xl gap-8 flex flex-col items-center">
          <div className="gap-4 flex flex-col items-center">
            <label
              htmlFor="name"
              className="block text-2xl font-semibold text-gray-50"
            >
              Enter your name to begin
            </label>
            <input
              id="name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-6 py-4 text-lg bg-gray-900 border border-gray-700 focus:border-green-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) onStart();
              }}
              disabled={isLoading}
            />
          </div>

          {/* Voice Call Controls */}
          <div className="w-full flex gap-4">
            {!isCallActive ? (
              <button
                onClick={() => startCall(userName || "Guest")}
                className="flex-1 px-6 py-4 bg-gray-400 hover:bg-green-600 text-black 
                           font-bold uppercase tracking-wider text-2xl border border-green-400
                           transform transition-all duration-200 hover:scale-x-105 hover:scale-y-105
                           active:bg-white active:text-black"
                style={{
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                }}
              >
                🎤 Start Voice Consultation
              </button>
            ) : (
              <button
                onClick={endCall}
                className="flex-1 px-6 py-4 bg-red-500 hover:bg-red-600 text-white 
                           font-bold uppercase tracking-wider text-sm border border-red-400
                           transform transition-all duration-200 hover:scale-x-105 hover:scale-y-105
                           active:bg-white active:text-black"
                style={{
                  boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                }}
              >
                End Call
              </button>
            )}
          </div>

          <VapiConversationIndicator />
        </div>

        {/* Features Grid */}
        <div className="flex gap-10 w-full">
          <div className="card p-8 space-y-3 hover:scale-105 transition-transform">
            <div className="text-green-400 text-3xl mb-2">🤖</div>
            <h3 className="text-green-400 font-semibold text-lg">
              <DecryptedText
                text="AI-Powered Support"
                speed={40}
                maxIterations={10}
                className="text-green-400"
                encryptedClassName="text-green-900"
              />
            </h3>
            <p className="text-sm text-gray-400">
              24/7 phone and web assistance with real-time guidance
            </p>
          </div>

          <div className="card p-8 space-y-3 hover:scale-105 transition-transform">
            <div className="text-blue-400 text-3xl mb-2">🌍</div>
            <h3 className="text-blue-400 font-semibold text-lg">
              <DecryptedText
                text="Comprehensive Solutions"
                speed={40}
                maxIterations={10}
                className="text-blue-400"
                encryptedClassName="text-blue-900"
              />
            </h3>
            <p className="text-sm text-gray-400">
              Visa, flights, housing, and school enrollment in one place
            </p>
          </div>

          <div className="card p-8 space-y-3 hover:scale-105 transition-transform">
            <div className="text-purple-400 text-3xl mb-2">💰</div>
            <h3 className="text-purple-400 font-semibold text-lg">
              <DecryptedText
                text="Transparent Pricing"
                speed={40}
                maxIterations={10}
                className="text-purple-400"
                encryptedClassName="text-purple-900"
              />
            </h3>
            <p className="text-sm text-gray-400">
              £1000/month until your visa is secured, first month free
            </p>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center gap-4 flex flex-col text-xs text-gray-600">
          <p>
            We analyze cheapest, fastest, most expensive, and most convenient
            options
          </p>
          <p>Personalized PDF reports delivered to your email</p>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-green-400 text-xl font-bold">
              📞 Call us directly: <DecryptedText
                text="+1 (628) 241 4121"
                speed={50}
                characters="0123456789+-() "
                useOriginalCharsOnly={true}
                className="text-green-400"
                encryptedClassName="text-green-700"
              />
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Available 24/7 for voice consultations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
