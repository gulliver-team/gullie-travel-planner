"use client";

import { getSignInUrl, withAuth } from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { signOutAction } from "@/app/actions";

type User = {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
};

export function Navigation() {
  const [user, setUser] = useState<User | null>(null);
  const [signInUrl, setSignInUrl] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuth() {
      try {
        const { user: authUser } = await withAuth();
        setUser(authUser);
        if (!authUser) {
          const url = await getSignInUrl();
          setSignInUrl(url);
        }
      } catch (error) {
        console.error("Auth error:", error);
        const url = await getSignInUrl();
        setSignInUrl(url);
      } finally {
        setLoading(false);
      }
    }
    fetchAuth();
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-electric">
      <div className="max-w-7xl mx-auto container px-8 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-bold text-electric hover:text-white transition-colors"
          >
            GULLIE
          </Link>

          <div className="flex items-center gap-6 min-h-[40px]">
            {loading ? (
              // Loading skeleton with same dimensions as actual content
              <div className="h-10 w-24 bg-electric/20 animate-pulse rounded" />
            ) : user ? (
              <>
                <Link href="/account">
                  <motion.button
                    whileHover={{ scale: 1.05, x: 2, y: -2, transition: { duration: 0.05 } }}
                    whileTap={{
                      scale: 0.95,
                      backgroundColor: "#00ffff",
                      color: "#000000",
                      transition: { duration: 0 }
                    }}
                    className="px-4 py-2 border border-electric text-electric"
                  >
                    Account
                  </motion.button>
                </Link>

                <Link href="/billing">
                  <motion.button
                    whileHover={{ scale: 1.05, x: 2, y: -2, transition: { duration: 0.05 } }}
                    whileTap={{
                      scale: 0.95,
                      backgroundColor: "#00ffff",
                      color: "#000000",
                      transition: { duration: 0 }
                    }}
                    className="px-4 py-2 border border-electric text-electric"
                  >
                    Billing
                  </motion.button>
                </Link>

                <div className="flex items-center gap-4">
                  <span className="text-electric/80 text-sm">
                    {user.firstName || user.email}
                  </span>

                  <form action={signOutAction}>
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.05, x: 2, y: -2, transition: { duration: 0.05 } }}
                      whileTap={{
                        scale: 0.95,
                        backgroundColor: "#ff0000",
                        color: "#ffffff",
                        transition: { duration: 0 }
                      }}
                      className="px-4 py-2 border border-red-500 text-red-500"
                    >
                      Sign Out
                    </motion.button>
                  </form>
                </div>
              </>
            ) : (
              <Link href={signInUrl}>
                <motion.button
                  whileHover={{ scale: 1.05, x: 2, y: -2, transition: { duration: 0.05 } }}
                  whileTap={{
                    scale: 0.95,
                    backgroundColor: "#00ffff",
                    color: "#000000",
                    transition: { duration: 0 }
                  }}
                  className="px-6 py-2 border border-electric text-electric"
                >
                  Sign In
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
