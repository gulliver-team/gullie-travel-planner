"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Vapi from "@vapi-ai/web";

interface VapiContextType {
  vapi: Vapi | null;
  isCallActive: boolean;
  isInitialized: boolean;
  transcript: Array<{ role: string; text: string }>;
  isSpeaking: boolean;
  startCall: (userName?: string) => Promise<void>;
  endCall: () => Promise<void>;
}

const VapiContext = createContext<VapiContextType | undefined>(undefined);

export function VapiProvider({ children }: { children: ReactNode }) {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    
    if (!publicKey) {
      console.error("NEXT_PUBLIC_VAPI_PUBLIC_KEY not configured");
      return;
    }

    const vapiInstance = new Vapi(publicKey);
    
    // Call lifecycle events
    vapiInstance.on("call-start", () => {
      console.log("Vapi call started");
      setIsCallActive(true);
      setTranscript([]);
    });

    vapiInstance.on("call-end", () => {
      console.log("Vapi call ended");
      setIsCallActive(false);
      setIsSpeaking(false);
    });

    // Speech events
    vapiInstance.on("speech-start", () => {
      setIsSpeaking(true);
    });

    vapiInstance.on("speech-end", () => {
      setIsSpeaking(false);
    });

    // Message events
    vapiInstance.on("message", (message: Record<string, unknown>) => {
      console.log("Vapi message:", message);
      
      if (message.type === "transcript") {
        setTranscript(prev => [...prev, {
          role: message.role as string,
          text: message.transcript as string
        }]);
      }

      // Mirror tool-call payloads to the browser for local wiring/testing
      if (message.type === "tool-calls") {
        try {
          const toolCallData = message as Record<string, unknown>;
          const toolCall = toolCallData.toolCall as Record<string, unknown> || 
                          (toolCallData.toolCallList as Record<string, unknown>[])?.[0] || null;
          const name = (toolCall?.name || (toolCall?.function as Record<string, unknown>)?.name) as string | undefined;
          const args = (toolCall?.arguments || (toolCall?.function as Record<string, unknown>)?.arguments) as unknown;
          console.log("Vapi tool-call:", name, args);

          if (name === "run_simulation" && typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("vapi:run_simulation", { detail: args }));
          }
        } catch (err) {
          console.error("Failed handling tool-calls message:", err);
        }
      }
    });

    // Error handling
    vapiInstance.on("error", (error) => {
      console.error("Vapi error:", error);
    });

    setVapi(vapiInstance);
    setIsInitialized(true);

    return () => {
      if (vapiInstance) {
        vapiInstance.stop();
      }
    };
  }, []);

  const startCall = async () => {
    if (!vapi || !isInitialized) {
      console.error("Vapi not initialized");
      return;
    }

    // Prevent multiple simultaneous call attempts
    if (isCallActive) {
      console.log("Call already active");
      return;
    }

    const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    if (!assistantId) {
      console.error("NEXT_PUBLIC_VAPI_ASSISTANT_ID not configured");
      return;
    }

    try {
      // Add a small delay to ensure audio processors are ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Start the call with custom configuration to avoid Krisp issues
      await vapi.start(assistantId);
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
      // Try to recover from the error
      setIsCallActive(false);
      setIsSpeaking(false);
    }
  };

  const endCall = async () => {
    if (vapi && isCallActive) {
      try {
        await vapi.stop();
      } catch (error) {
        console.error("Failed to end Vapi call:", error);
      }
    }
  };

  return (
    <VapiContext.Provider value={{
      vapi,
      isCallActive,
      isInitialized,
      transcript,
      isSpeaking,
      startCall,
      endCall
    }}>
      {children}
    </VapiContext.Provider>
  );
}

export function useVapi() {
  const context = useContext(VapiContext);
  if (context === undefined) {
    throw new Error("useVapi must be used within a VapiProvider");
  }
  return context;
}
