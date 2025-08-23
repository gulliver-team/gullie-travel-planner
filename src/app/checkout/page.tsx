"use client";

import { withAuth } from "@workos-inc/authkit-nextjs";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";

type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export default function CheckoutPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initiatingCheckout, setInitiatingCheckout] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      try {
        const { user: authUser } = await withAuth();
        setUser(authUser);
      } catch (error) {
        console.error("Auth error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleCheckout = async () => {
    if (!user || !user.email) {
      alert("Please sign in with an email address to continue");
      return;
    }

    setInitiatingCheckout(true);
    
    try {
      // Call the API to create a Polar checkout session
      const response = await fetch("/api/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID || "c66ea195-003c-44b5-b34a-ad16c02408e8",
          customerId: user.id,
          customerEmail: user.email,
          customerName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { checkoutUrl } = await response.json();
      
      // Redirect to Polar checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate checkout. Please try again.");
      setInitiatingCheckout(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-electric animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-electric mb-4">Sign In Required</h1>
          <p className="text-gray-400 mb-8">Please sign in to continue with your subscription</p>
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, x: 2, y: -2 }}
              whileTap={{ scale: 0.95, backgroundColor: "#00ffff", color: "#000000" }}
              className="px-6 py-3 border border-electric text-electric hover:bg-electric/10 transition-all"
            >
              Go to Home
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full px-8">
        <h1 className="text-4xl font-bold text-electric mb-8 text-center">
          Upgrade to Premium
        </h1>
        
        <div className="border border-electric/30 p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Premium Features</h2>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <span className="text-electric mr-3">▸</span>
              <span className="text-gray-300">Unlimited AI-powered relocation consultations</span>
            </li>
            <li className="flex items-start">
              <span className="text-electric mr-3">▸</span>
              <span className="text-gray-300">Priority visa processing guidance</span>
            </li>
            <li className="flex items-start">
              <span className="text-electric mr-3">▸</span>
              <span className="text-gray-300">Comprehensive PDF reports for all destinations</span>
            </li>
            <li className="flex items-start">
              <span className="text-electric mr-3">▸</span>
              <span className="text-gray-300">Real-time flight and accommodation tracking</span>
            </li>
            <li className="flex items-start">
              <span className="text-electric mr-3">▸</span>
              <span className="text-gray-300">24/7 voice assistant support</span>
            </li>
            <li className="flex items-start">
              <span className="text-electric mr-3">▸</span>
              <span className="text-gray-300">Personalized relocation timeline planning</span>
            </li>
          </ul>
          
          <div className="text-center border-t border-electric/20 pt-6">
            <div className="text-3xl font-bold text-electric mb-2">$990/month</div>
            <p className="text-gray-400 text-sm mb-6">Cancel anytime, no hidden fees</p>
            
            <motion.button
              whileHover={{ scale: 1.05, x: 2, y: -2 }}
              whileTap={{ scale: 0.95, backgroundColor: "#00ffff", color: "#000000" }}
              className="w-full px-6 py-3 border border-electric text-electric hover:bg-electric/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleCheckout}
              disabled={initiatingCheckout}
            >
              {initiatingCheckout ? "Processing..." : "Subscribe Now"}
            </motion.button>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            Secure payment processed by Polar
          </p>
          <p className="text-gray-400 text-sm mt-2">
            By subscribing, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
}