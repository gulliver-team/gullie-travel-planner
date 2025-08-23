"use client";

import { useState } from "react";
import { usePDFUpload } from "@/hooks/usePDFUpload";

interface EmailCaptureModalProps {
  result: {
    type: string;
    visaType: string;
    timeline: string;
    totalCost: string;
    highlights?: string[];
  };
  userName: string;
  onClose: () => void;
}

export function EmailCaptureModal({ result, userName, onClose }: EmailCaptureModalProps) {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { uploadPDF } = usePDFUpload();

  const handleSubmit = async () => {
    if (!email || !phone) return;
    
    setIsSubmitting(true);
    
    try {
      // Get cities from session storage or use defaults
      const originCity = sessionStorage.getItem("originCity") || "Your City";
      const originCountry = sessionStorage.getItem("originCountry") || "Your Country";
      const destinationCity = sessionStorage.getItem("destinationCity") || "Destination City";
      const destinationCountry = sessionStorage.getItem("destinationCountry") || "Destination Country";

      // Format visa options from result
      const visaOptions = `
        **${result.visaType}**
        Timeline: ${result.timeline}
        Total Cost: ${result.totalCost}
        ${result.highlights ? `\nHighlights:\n${result.highlights.map(h => `• ${h}`).join('\n')}` : ''}
      `;

      // 1. Generate and upload PDF to Convex storage
      const storageId = await uploadPDF({
        name: userName,
        email,
        originCity,
        originCountry,
        destinationCity,
        destinationCountry,
        visaOptions,
      });

      if (storageId) {
        // 2. Send email through API with PDF reference
        await fetch("/api/email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            userName,
            storageId,
            fromCity: originCity,
            toCity: destinationCity,
            selectedOption: result
          })
        });

        alert("Report sent to your email!");
        onClose();
      } else {
        // Fallback: Send email without PDF
        await fetch("/api/email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              userName,
              fromCity: "Current Location",
              toCity: "Destination",
              selectedOption: result
            })
          });

          // 3. Redirect to checkout
          const checkoutResponse = await fetch("/api/polar/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              userName,
              metadata: { selectedOption: result.type }
            })
          });

          const { checkoutUrl } = await checkoutResponse.json();
          
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            alert("Report sent to your email!");
            onClose();
          }
      }
    } catch (error) {
      console.error("Error processing request:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-6 z-50 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 p-10 max-w-md w-full space-y-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">Get Your Full Report</h2>
          <p className="text-gray-400">
            We&apos;ll send a comprehensive PDF with all pricing details and next steps.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Email Address</label>
            <input
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-gray-700 focus:border-green-500"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-400">Phone Number</label>
            <input
              type="tel"
              placeholder="+44 20 1234 5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-gray-700 focus:border-green-500"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !email || !phone}
            className={`flex-1 px-6 py-3 font-semibold transition-all transform ${
              !isSubmitting && email && phone
                ? "bg-green-500 text-black hover:bg-green-400 hover:scale-105 active:scale-95"
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
            ) : (
              "Send Report"
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border border-gray-600 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center">
          By submitting, you agree to our £1000/month service after the first free month.
          Cancel anytime before your visa is secured.
        </p>
      </div>
    </div>
  );
}