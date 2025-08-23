import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import { VapiProvider } from "@/providers/VapiProvider";
import { AuthKitProvider } from "@workos-inc/authkit-nextjs/components";
import { Navigation } from "@/components/Navigation";

const distekMono = localFont({
  src: [
    {
      path: "../../public/fonts/Disket-Mono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Disket-Mono-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-distek-mono",
  fallback: ["monospace"],
});

export const metadata: Metadata = {
  title: "Gullie - Global Mobility Expert",
  description:
    "Your AI-powered global relocation consultant. Get visa guidance, flight options, housing solutions, and comprehensive relocation support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${distekMono.variable} font-mono antialiased bg-black text-white min-h-screen`}
      >
        <AuthKitProvider>
          <ConvexClientProvider>
            <VapiProvider>
              <Navigation />
              <div className="flex flex-col items-center justify-center  pt-24 min-h-screen">
                {children}
              </div>
            </VapiProvider>
          </ConvexClientProvider>
        </AuthKitProvider>
      </body>
    </html>
  );
}
