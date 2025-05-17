"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Navbar } from "@/components/navbar";
import { ExpenseList } from "@/components/expense-list";

export default function DashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUserId(data.user?.id || null);
    }
    getUser();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="pixel-text text-3xl text-[#ff4500] font-bold mb-8 text-center">
          Dashboard
        </h1>
        {userId ? (
          <ExpenseList userId={userId} />
        ) : (
          <div className="text-center pixel-text text-lg text-[#ff4500]">
            Loading your data...
          </div>
        )}
      </main>
    </div>
  );
}
