"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DecryptedText from "@/components/DecryptedText";

export default function SuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl px-4">
        <div className="space-y-4">
          <div className="text-6xl">✓</div>
          <h1 className="text-4xl font-bold">
            <DecryptedText
              text="Welcome to Gullie!"
              animateOn="view"
              speed={60}
              sequential={true}
              revealDirection="center"
              className="gradient-text"
              encryptedClassName="text-gray-700"
            />
          </h1>
        </div>

        <div className="space-y-4 text-gray-300">
          <p className="text-xl">
            Your subscription has been activated successfully.
          </p>
          <p>
            You now have full access to our AI-powered relocation services.
          </p>
        </div>

        <div className="card p-8 space-y-4">
          <h2 className="text-2xl font-semibold text-green-400">
            <DecryptedText
              text="What's Next?"
              speed={40}
              maxIterations={10}
              className="text-green-400"
              encryptedClassName="text-green-900"
            />
          </h2>
          <ul className="space-y-3 text-left text-gray-400">
            <li>• Call us anytime for personalized support</li>
            <li>• Access unlimited visa consultations</li>
            <li>• Get real-time updates on your application</li>
            <li>• Receive priority processing on all requests</li>
          </ul>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Your first month is FREE. You&apos;ll be charged £1000/month starting next month.
          </p>
          <p className="text-sm text-gray-500">
            Cancel anytime before your visa is secured.
          </p>
        </div>

        <div className="text-gray-600">
          Redirecting to dashboard in {countdown} seconds...
        </div>
      </div>
    </main>
  );
}