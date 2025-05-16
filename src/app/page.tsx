"use client";
import { Navbar } from "@/components/navbar";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ExpenseList } from "@/components/expense-list";

export default function Home() {
  const [user, setUser] = useState<null | {
    id: string;
    user_metadata?: { full_name?: string };
  }>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center mt-12 mb-8">
            <h1 className="text-3xl font-bold mb-4">
              Welcome to the Expense Tracker App!
            </h1>
            <p className="text-muted-foreground">
              Start tracking your expenses and managing your finances
              efficiently.
            </p>
          </div>
          <ExpenseList userId={user.id} />
        </div>
      </main>
    </div>
  );
}
