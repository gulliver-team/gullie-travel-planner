"use client";

import { useState } from "react";
import { LandingHero } from "@/components/LandingHero";
import { VapiConversationIndicator } from "@/components/VapiConversationIndicator";
import { SimulationModal } from "@/components/SimulationModal";
import { useVapi } from "@/providers/VapiProvider";

export default function Home() {
  const [userName] = useState("");
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const { endCall, isCallActive } = useVapi();

  return (
    <main className="min-h-screen bg-black flex items-center justify-center ">
      <LandingHero
        userName={userName}
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
