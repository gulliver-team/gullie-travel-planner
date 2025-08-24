"use client";

import { VapiConversationIndicator } from "./VapiConversationIndicator";
import { useVapi } from "@/providers/VapiProvider";
import DecryptedText from "./DecryptedText";
import { motion } from "motion/react";
import { useState } from "react";

interface LandingHeroProps {
  userName: string;
  setUserName: (name: string) => void;
  onStart: () => void;
  isLoading?: boolean;
  onOpenSimulation: () => void;
}

export function LandingHero({
  userName,
  setUserName,
  onStart,
  isLoading,
  onOpenSimulation,
}: LandingHeroProps) {
  const { startCall, endCall, isCallActive } = useVapi();
  const [activeTab, setActiveTab] = useState<"voice" | "simulation">("voice");

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Header Section */}
        <div className="text-center py-6 flex flex-col items-center space-y-3">
          <h1 className="text-2xl md:text-8xl font-bold">
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
          <p className="text-6xl font-semibold md:text-3xl text-gray-300">
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
              text="Find the optimal relocation plan to move from one city to another"
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
          {/* Tab Selection - Direct triggers */}
          <div className="w-full">
            {!isCallActive ? (
              <div className="flex gap-0 border border-green-500/30">
                <motion.button
                  onClick={() => {
                    setActiveTab("voice");
                    startCall(userName || "Guest");
                  }}
                  className={`flex-1 px-6 py-4 font-bold uppercase tracking-wider text-lg transition-all ${
                    activeTab === "voice"
                      ? "bg-green-500 text-black border-r border-green-500"
                      : "bg-black text-green-500 border-r border-green-500/30 hover:bg-green-500/10"
                  }`}
                  whileHover={{
                    x: activeTab === "voice" ? 0 : 2,
                    y: activeTab === "voice" ? 0 : -2,
                    transition: { duration: 0.05 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    backgroundColor: "#00ff00",
                    color: "#000000",
                    transition: { duration: 0 },
                  }}
                >
                  🎤 Voice Consultation
                </motion.button>
                <motion.button
                  onClick={() => {
                    setActiveTab("simulation");
                    onOpenSimulation();
                  }}
                  className={`flex-1 px-6 py-4 font-bold uppercase tracking-wider text-lg transition-all ${
                    activeTab === "simulation"
                      ? "bg-green-500 text-black"
                      : "bg-black text-green-500 hover:bg-green-500/10"
                  }`}
                  whileHover={{
                    x: activeTab === "simulation" ? 0 : 2,
                    y: activeTab === "simulation" ? 0 : -2,
                    transition: { duration: 0.05 },
                  }}
                  whileTap={{
                    scale: 0.95,
                    backgroundColor: "#00ff00",
                    color: "#000000",
                    transition: { duration: 0 },
                  }}
                >
                  📊 Run Simulations
                </motion.button>
              </div>
            ) : (
              <motion.button
                onClick={endCall}
                className="w-full px-6 py-4 bg-black text-red-500 
                           font-bold uppercase tracking-wider text-xl border border-red-500"
                whileHover={{
                  x: 2,
                  y: -2,
                  transition: { duration: 0.05 },
                }}
                whileTap={{
                  scale: 0.95,
                  backgroundColor: "#ff0000",
                  color: "#ffffff",
                  transition: { duration: 0 },
                }}
              >
                End Call
              </motion.button>
            )}
          </div>
          <div className="text-center gap-4 flex flex-col text-xs text-gray-600">
            <div className="mt-4 pt-4 border-t border-gray-800">
              <p className="text-green-400 text-xl font-bold">
                📞 Call us directly:{" "}
                <DecryptedText
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
              $990/month until your relocation is completed, first month free
            </p>
          </div>
        </div>

        {/* Simulations IFrame Preview
        <div className="w-full max-w-6xl mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-200">Simulations Preview</h2>
            <span className="text-xs text-gray-500">Loaded from localhost:8080</span>
          </div>
          <div className="border border-gray-800">
            <iframe
              title="Simulations"
              src={process.env.NEXT_PUBLIC_SIMULATIONS_URL || "http://localhost:8080"}
              className="w-full"
              style={{ height: "900px", backgroundColor: "#0a0b0d" }}
            />
          </div>
        </div> */}
      </div>
    </div>
  );
}
