"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";

//TODO: Add NEXT_PUBLIC_CONVEX_URL to .env.local
// Get from: https://dashboard.convex.dev
const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL || ""
);

export function ConvexClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}