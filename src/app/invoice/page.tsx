"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  created_at: string;
}

function InvoicePageContent() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [currency, setCurrency] = useState<Currency>({
    code: "USD",
    symbol: "$",
    name: "US Dollar",
  });
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserAndExpenses = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const currencyCode = searchParams.get("currency") || "USD";
      const { data: currencyData } = await supabase
        .from("currencies")
        .select("code, symbol, name")
        .eq("code", currencyCode)
        .single();
      if (currencyData) setCurrency(currencyData as Currency);
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("id, title, amount, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setExpenses((expensesData as Expense[]) || []);
      setLoading(false);
    };
    fetchUserAndExpenses();
    // eslint-disable-next-line
  }, []);

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground py-8 px-2 sm:px-0 transition-colors duration-300">
      <Card className="w-full max-w-2xl shadow-2xl border-none rounded-3xl bg-background text-foreground backdrop-blur-md transition-colors duration-300">
        <CardHeader className="rounded-t-3xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#ff4500]/90 to-[#ffb347]/80 py-6 px-4 text-center">
            <CardTitle className="pixel-text text-2xl sm:text-3xl text-white drop-shadow font-bold tracking-tight">
              <span className="inline-flex items-center gap-2">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="inline-block"
                >
                  <path
                    d="M3 6.75C3 5.23122 4.23122 4 5.75 4H18.25C19.7688 4 21 5.23122 21 6.75V17.25C21 18.7688 19.7688 20 18.25 20H5.75C4.23122 20 3 18.7688 3 17.25V6.75Z"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 8H17M7 12H17M7 16H13"
                    stroke="#fff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                Expense Invoice
              </span>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-8">
          {loading ? (
            <div className="text-center text-muted-foreground py-8 pixel-text text-lg">
              Loading...
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center text-muted-foreground py-8 pixel-text text-lg">
              There are no expenses to show.
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto rounded-xl border border-[#ff4500]/10 bg-white/80 dark:bg-zinc-900/80">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pixel-text text-base sm:text-lg text-[#ff4500] bg-transparent border-none">
                        Title
                      </TableHead>
                      <TableHead className="pixel-text text-base sm:text-lg text-right text-[#ff4500] bg-transparent border-none">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense, idx) => (
                      <TableRow
                        key={expense.id}
                        className={
                          idx % 2 === 0
                            ? "bg-[#ff4500]/[0.04] dark:bg-[#ff4500]/[0.10]"
                            : ""
                        }
                      >
                        <TableCell className="pixel-text font-medium text-base py-3 px-2 sm:px-4">
                          {expense.title}
                        </TableCell>
                        <TableCell className="pixel-text text-right font-semibold text-base text-[#ff4500] py-3 px-2 sm:px-4">
                          {currency.symbol}
                          {expense.amount.toFixed(2)} {currency.code}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-8 gap-4">
                <div className="pixel-text text-lg sm:text-xl font-extrabold text-[#ff4500] bg-[#ff4500]/10 dark:bg-[#ff4500]/20 rounded-xl px-6 py-3 shadow-inner">
                  Total: {currency.symbol}
                  {total.toFixed(2)} {currency.code}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="cyber-button pixel-text px-6 py-2 text-base sm:text-lg rounded-xl border-2 border-[#ff4500] hover:bg-[#ff4500]/10 transition-all"
              onClick={() => router.push("/")}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <InvoicePageContent />
    </Suspense>
  );
}
