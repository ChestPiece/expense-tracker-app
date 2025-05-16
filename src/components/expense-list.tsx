"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function ExpenseList({ userId }: { userId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, [userId]);

  useEffect(() => {
    async function fetchCurrenciesAndPreference() {
      setCurrencyLoading(true);
      const { data: currenciesData, error: currenciesError } = await supabase
        .from("currencies")
        .select("code, symbol, name");
      if (!currenciesError && currenciesData)
        setCurrencies(currenciesData as Currency[]);
      // Fetch user preference
      const { data: prefData } = await supabase
        .from("user_preferences")
        .select("currency_code")
        .eq("user_id", userId)
        .single();
      if (prefData && prefData.currency_code)
        setCurrency(prefData.currency_code);
      setCurrencyLoading(false);
    }
    fetchCurrenciesAndPreference();
  }, [userId]);

  async function fetchExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("id, title, amount, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setExpenses(data as Expense[]);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount) return;
    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      title,
      amount: parseFloat(amount),
    });
    if (!error) {
      setTitle("");
      setAmount("");
      fetchExpenses();
    }
  }

  async function handleDelete(id: string) {
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
  }

  async function handleEdit(id: string) {
    setEditingId(id);
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      setEditTitle(expense.title);
      setEditAmount(expense.amount.toString());
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editTitle || !editAmount) return;
    await supabase
      .from("expenses")
      .update({ title: editTitle, amount: parseFloat(editAmount) })
      .eq("id", editingId);
    setEditingId(null);
    setEditTitle("");
    setEditAmount("");
    fetchExpenses();
  }

  async function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);
    // Update user preference in DB
    await supabase.from("user_preferences").upsert({
      user_id: userId,
      currency_code: newCurrency,
    });
  }

  const currencyObj = currencies.find((c) => c.code === currency) || {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
  };

  return (
    <div className="max-w-2xl mx-auto mt-12">
      <div className="flex items-center gap-4 mb-6">
        <label
          htmlFor="currency"
          className="pixel-text text-[#ff4500] font-bold"
        >
          Currency:
        </label>
        {currencyLoading ? (
          <span className="text-muted-foreground pixel-text">
            Loading currencies...
          </span>
        ) : (
          <select
            id="currency"
            className="border rounded px-2 py-1 pixel-text text-[#ff4500] bg-white"
            value={currency}
            onChange={handleCurrencyChange}
          >
            {currencies.map((c) => (
              <option
                key={c.code}
                value={c.code}
                className="pixel-text text-black"
              >
                {c.code} ({c.symbol}) - {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <Input
          placeholder="Expense title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="cyber-input pixel-text"
        />
        <Input
          placeholder="Amount"
          type="number"
          min="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="cyber-input pixel-text"
        />
        <Button type="submit" className="cyber-button pixel-text">
          Add
        </Button>
      </form>
      {loading ? (
        <div className="text-center text-muted-foreground pixel-text">
          Loading...
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center text-muted-foreground py-8 pixel-text">
          There are no expenses added yet! Start adding expenses
        </div>
      ) : (
        <>
          <ul className="space-y-4 mb-8">
            {expenses.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between bg-white border rounded px-4 py-2 cyber-card"
              >
                {editingId === expense.id ? (
                  <form onSubmit={handleUpdate} className="flex gap-2 flex-1">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="cyber-input pixel-text"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editAmount}
                      onChange={(e) => setEditAmount(e.target.value)}
                      className="cyber-input pixel-text"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      className="cyber-button pixel-text"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                      className="cyber-button pixel-text"
                    >
                      Cancel
                    </Button>
                  </form>
                ) : (
                  <>
                    <div className="flex-1">
                      <div className="pixel-text font-bold text-lg text-[#ff4500]">
                        {expense.title}
                      </div>
                      <div className="text-muted-foreground text-sm pixel-text">
                        {currencyObj.symbol}
                        {expense.amount.toFixed(2)} {currencyObj.code}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(expense.id)}
                        className="cyber-button pixel-text"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(expense.id)}
                        className="cyber-button pixel-text"
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
          <div className="flex justify-center">
            <Button
              variant="default"
              onClick={() => router.push(`/invoice?currency=${currency}`)}
              className="cyber-button pixel-text"
            >
              Check your total expense
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
