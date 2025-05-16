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
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted py-12">
      <Card className="w-full max-w-2xl shadow-2xl border rounded-2xl bg-white dark:bg-zinc-900">
        <CardHeader className="bg-muted rounded-t-2xl border-b">
          <CardTitle className="pixel-text text-3xl text-[#ff4500] text-center tracking-tight py-2">
            Expense Invoice
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pixel-text text-lg text-[#ff4500]">
                      Title
                    </TableHead>
                    <TableHead className="pixel-text text-lg text-right text-[#ff4500]">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="hover:bg-muted/40 transition-all"
                    >
                      <TableCell className="pixel-text font-medium text-base">
                        {expense.title}
                      </TableCell>
                      <TableCell className="pixel-text text-right font-semibold text-base text-[#ff4500]">
                        {currency.symbol}
                        {expense.amount.toFixed(2)} {currency.code}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-end mt-8">
                <div className="pixel-text text-2xl font-extrabold text-[#ff4500]">
                  Total: {currency.symbol}
                  {total.toFixed(2)} {currency.code}
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="cyber-button pixel-text"
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
