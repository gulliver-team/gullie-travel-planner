"use client";

import { withAuth } from "@workos-inc/authkit-nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Id } from "../../../convex/_generated/dataModel";

type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

type Checkout = {
  _id: Id<"checkouts">;
  checkoutId: string;
  customerId: string;
  productId: string;
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: number;
  _creationTime: number;
};

export default function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const subscription = useQuery(
    api.subscriptions.getUserSubscription,
    user ? { userId: user.id } : "skip"
  );

  const checkouts = useQuery(
    api.subscriptions.getUserCheckouts,
    user ? { customerId: user.id } : "skip"
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-electric animate-pulse">
          Loading billing information...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-electric mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-400 mb-8">
            Please sign in to view your billing information
          </p>
          <Link href="/">
            <motion.button
              whileHover={{ 
                scale: 1.05, 
                x: 2, 
                y: -2,
                transition: { duration: 0.05 }
              }}
              whileTap={{
                scale: 0.95,
                backgroundColor: "#00ffff",
                color: "#000000",
                transition: { duration: 0 }
              }}
              className="px-6 py-3 border border-electric text-electric"
            >
              Go to Home
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amount is in cents
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-electric mb-8 text-center">
          Billing & Subscription
        </h1>

        {/* Current Subscription */}
        <div className="border border-electric/30 p-8 mb-8">
          <h2 className="text-2xl font-bold text-electric mb-4">
            Current Subscription
          </h2>

          {subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span
                  className={`font-bold ${
                    subscription.status === "active"
                      ? "text-green-500"
                      : subscription.status === "canceled"
                        ? "text-red-500"
                        : "text-yellow-500"
                  }`}
                >
                  {subscription.status.toUpperCase()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-400">Current Period:</span>
                <span className="text-white">
                  {formatDate(subscription.currentPeriodStart)} -{" "}
                  {formatDate(subscription.currentPeriodEnd)}
                </span>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="bg-red-500/10 border border-red-500/30 p-3 mt-4">
                  <p className="text-red-400">
                    Your subscription will be canceled at the end of the current
                    period
                  </p>
                </div>
              )}

              <div className="mt-6 flex gap-4">
                {subscription.status === "active" &&
                  !subscription.cancelAtPeriodEnd && (
                    <motion.button
                      whileHover={{ 
                        scale: 1.05, 
                        x: 2, 
                        y: -2,
                        transition: { duration: 0.05 }
                      }}
                      whileTap={{
                        scale: 0.95,
                        backgroundColor: "#ff0000",
                        color: "#ffffff",
                        transition: { duration: 0 }
                      }}
                      className="px-4 py-3 border border-red-500 text-red-500"
                      onClick={() => {
                        // TODO: Implement cancel subscription via Polar API
                        console.log("Cancel subscription");
                      }}
                    >
                      Cancel Subscription
                    </motion.button>
                  )}

                {subscription.cancelAtPeriodEnd && (
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      x: 2, 
                      y: -2,
                      transition: { duration: 0.05 }
                    }}
                    whileTap={{
                      scale: 0.95,
                      backgroundColor: "#00ffff",
                      color: "#000000",
                      transition: { duration: 0 }
                    }}
                    className="px-4 py-3 border border-electric text-electric"
                    onClick={() => {
                      // TODO: Implement reactivate subscription via Polar API
                      console.log("Reactivate subscription");
                    }}
                  >
                    Reactivate Subscription
                  </motion.button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6">
                You don&apos;t have an active subscription
              </p>
              <Link href="/checkout">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    x: 2, 
                    y: -2,
                    transition: { duration: 0.05 }
                  }}
                  whileTap={{
                    scale: 0.95,
                    backgroundColor: "#00ffff",
                    color: "#000000",
                    transition: { duration: 0 }
                  }}
                  className="px-10 py-3 border bg-gray-800 text-white"
                >
                  Get Started with Premium
                </motion.button>
              </Link>
            </div>
          )}
        </div>

        {/* Billing History */}
        <div className="border border-electric/30 p-8">
          <h2 className="text-2xl font-bold text-electric mb-4">
            Billing History
          </h2>

          {checkouts && checkouts.length > 0 ? (
            <div className="space-y-4">
              {checkouts.map((checkout: Checkout) => (
                <div
                  key={checkout._id}
                  className="border-b border-electric/20 pb-4 last:border-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">
                        {formatCurrency(checkout.amount, checkout.currency)}
                      </p>
                      <p className="text-gray-400 text-sm">
                        {formatDate(new Date(checkout.createdAt).toISOString())}
                      </p>
                    </div>
                    <span className="text-green-500 text-sm">
                      {checkout.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No billing history available</p>
          )}
        </div>
      </div>
    </div>
  );
}
