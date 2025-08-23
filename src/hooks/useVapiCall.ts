"use client";

import { useState, useEffect } from "react";
import Vapi from "@vapi-ai/web";

interface VapiMessage {
  type: string;
  [key: string]: unknown;
}

export function useVapiCall() {
  const [vapi, setVapi] = useState<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callData, setCallData] = useState<VapiMessage | null>(null);

  useEffect(() => {
    //TODO: Add VAPI_PUBLIC_KEY to .env.local
    const publicKey = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY;
    
    if (publicKey) {
      const vapiInstance = new Vapi(publicKey);
      
      vapiInstance.on("call-start", () => {
        setIsCallActive(true);
      });

      vapiInstance.on("call-end", () => {
        setIsCallActive(false);
      });

      vapiInstance.on("message", (message) => {
        console.log("Vapi message:", message);
        setCallData(message);
      });

      setVapi(vapiInstance);
    }
  }, []);

  const startCall = async () => {
    if (!vapi) {
      console.error("Vapi not initialized");
      return;
    }

    try {
      //TODO: Add VAPI_ASSISTANT_ID to .env.local
      // Create assistant at https://dashboard.vapi.ai
      // Configure with greeting: "Hi {{user_name}} this is Gullie Agent, which city are you considering relocation today?"
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      
      if (!assistantId) {
        console.error("VAPI_ASSISTANT_ID not configured");
        return;
      }

      await vapi.start(assistantId);
    } catch (error) {
      console.error("Failed to start Vapi call:", error);
    }
  };

  const endCall = async () => {
    if (vapi && isCallActive) {
      await vapi.stop();
    }
  };

  return {
    startCall,
    endCall,
    isCallActive,
    callData
  };
}