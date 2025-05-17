"use client";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <h1 className="pixel-text break-words text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-[#ff4500]">TRACK</span>
                <span className="text-white">YOUR</span>
                <span className="text-[#ff4500]">EXPENSES</span>
              </h1>
              <p className="pixel-text text-base xs:text-lg sm:text-xl text-gray-400 mb-8 max-w-xs xs:max-w-md sm:max-w-2xl mx-auto break-words">
                Take control of your finances with our cyberpunk-themed expense
                tracker. Monitor your spending, set budgets, and achieve your
                financial goals.
              </p>
              <div className="flex flex-col xs:flex-row justify-center gap-4">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="cyber-button pixel-text w-full xs:w-auto"
                  >
                    Get Started
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="cyber-button pixel-text w-full xs:w-auto"
                  >
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-black/50 border-t border-b border-[#ff4500]/20 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="cyber-card p-6">
                <h3 className="pixel-text text-[#ff4500] text-xl font-bold mb-4">
                  Category Budgeting
                </h3>
                <p className="text-gray-400">
                  Organize expenses by categories and set budgets for each.
                </p>
              </div>
              <div className="cyber-card p-6">
                <h3 className="pixel-text text-[#ff4500] text-xl font-bold mb-4">
                  Real-time Tracking
                </h3>
                <p className="text-gray-400">
                  Monitor your spending in real-time with dynamic progress bars.
                </p>
              </div>
              <div className="cyber-card p-6">
                <h3 className="pixel-text text-[#ff4500] text-xl font-bold mb-4">
                  Multi-currency Support
                </h3>
                <p className="text-gray-400">
                  Track expenses in your preferred currency with easy switching.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
