"use client";

import { useState } from "react";
import { LandingHero } from "@/components/LandingHero";
import { VapiConversationIndicator } from "@/components/VapiConversationIndicator";
import { SimulationModal } from "@/components/SimulationModal";
import { useRouter } from "next/navigation";
import { useVapi } from "@/providers/VapiProvider";

export default function Home() {
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const router = useRouter();
  const { endCall, isCallActive } = useVapi();

  const handleStart = async () => {
    if (!userName.trim()) return;

    setIsLoading(true);

    // Store user name in sessionStorage for the consultation page
    sessionStorage.setItem("userName", userName);

    // Navigate to consultation page
    router.push("/consultation");

    // Don't start the call here - let user start it manually from consultation page
  };

  return (
    <main className="min-h-screen bg-black flex items-center justify-center ">
      <LandingHero
        userName={userName}
        setUserName={setUserName}
        onStart={handleStart}
        isLoading={isLoading}
        onOpenSimulation={async () => {
          if (isCallActive) {
            await endCall();
          }
          setIsSimulationOpen(true);
        }}
      />

      {/* Show the Vapi indicator with showAlways prop */}
      {!isSimulationOpen && <VapiConversationIndicator showAlways={true} />}

      {/* Simulation Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        startCity=""
        destinationCity=""
      />
    </main>
  );
}
