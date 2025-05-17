"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ConfirmDialog } from "@/components/confirm-dialog";

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
  category_id?: string;
}

interface Category {
  id: string;
  user_id: string;
  name: string;
  budget: number;
}

export function ExpenseList({ userId }: { userId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryBudget, setEditCategoryBudget] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "category">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchExpenses();
    // eslint-disable-next-line
  }, [userId, supabase]);

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
  }, [userId, supabase]);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories")
        .select("id, user_id, name, budget")
        .eq("user_id", userId);
      if (!error && data) setCategories(data as Category[]);
    }
    fetchCategories();
  }, [userId, supabase]);

  async function fetchExpenses() {
    setLoading(true);
    const { data, error } = await supabase
      .from("expenses")
      .select("id, title, amount, created_at, category_id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (!error && data) setExpenses(data as Expense[]);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !amount || !categoryId) return;
    const { error } = await supabase.from("expenses").insert({
      user_id: userId,
      title,
      amount: parseFloat(amount),
      category_id: categoryId,
    });
    if (!error) {
      setTitle("");
      setAmount("");
      setCategoryId("");
      fetchExpenses();
    }
  }

  async function handleDelete(id: string) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (pendingDeleteId) {
      await supabase.from("expenses").delete().eq("id", pendingDeleteId);
      setPendingDeleteId(null);
      setConfirmOpen(false);
      fetchExpenses();
    }
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

  // Filter and sort expenses
  const filteredExpenses = expenses
    .filter((e) => {
      const cat = categories.find((c) => c.id === e.category_id)?.name || "";
      return (
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        cat.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return sortDir === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      } else if (sortBy === "amount") {
        return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
      } else {
        // category
        const catA = categories.find((c) => c.id === a.category_id)?.name || "";
        const catB = categories.find((c) => c.id === b.category_id)?.name || "";
        return sortDir === "asc"
          ? catA.localeCompare(catB)
          : catB.localeCompare(catA);
      }
    });

  return (
    <div className="max-w-2xl mx-auto mt-16 mb-12">
      <p className="pixel-text text-base text-muted-foreground mb-6 text-center">
        Track your expenses, manage budgets, and see your spending progress in
        one place.
      </p>
      <div className="flex items-center gap-4 mb-2">
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
            className="border rounded px-2 py-1 pixel-text text-[#ff4500] bg-white max-w-xs w-48"
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
      <p className="pixel-text text-xs text-muted-foreground mb-4">
        Choose your preferred currency for all expenses and budgets.
      </p>
      <form onSubmit={handleAdd} className="flex gap-2 mb-2 flex-wrap">
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
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="border rounded px-2 py-1 pixel-text text-[#ff4500] bg-white"
          required
        >
          <option value="" disabled>
            Select category
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <Button type="submit" className="cyber-button pixel-text">
          Add
        </Button>
      </form>
      <p className="pixel-text text-xs text-muted-foreground mb-4">
        Add a new expense to track your spending. Select a category to organize
        your expenses.
      </p>
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4 items-center justify-between">
        <Input
          placeholder="Search expenses or categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pixel-text w-full sm:w-1/2"
        />
        <div className="flex gap-2 items-center">
          <label className="pixel-text text-xs text-muted-foreground">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "date" | "amount" | "category")
            }
            className="pixel-text border rounded px-2 py-1"
          >
            <option value="date">Date</option>
            <option value="amount">Amount</option>
            <option value="category">Category</option>
          </select>
          <button
            type="button"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="pixel-text border rounded px-2 py-1"
            aria-label="Toggle sort direction"
          >
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
      {/* Category Management Section */}
      <div className="mb-8">
        <h2 className="pixel-text text-lg text-[#ff4500] mb-2">
          Categories & Budgets
        </h2>
        <ul className="mb-4 space-y-2">
          {categories.map((cat) => (
            <li key={cat.id} className="flex items-center gap-2">
              {editingCategoryId === cat.id ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await supabase
                      .from("categories")
                      .update({
                        name: editCategoryName,
                        budget: parseFloat(editCategoryBudget),
                      })
                      .eq("id", cat.id);
                    setEditingCategoryId(null);
                    setEditCategoryName("");
                    setEditCategoryBudget("");
                    // Refresh
                    const { data } = await supabase
                      .from("categories")
                      .select("id, user_id, name, budget")
                      .eq("user_id", userId);
                    if (data) setCategories(data as Category[]);
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={editCategoryName}
                    onChange={(e) => setEditCategoryName(e.target.value)}
                    className="cyber-input pixel-text"
                    placeholder="Category name"
                    required
                  />
                  <Input
                    value={editCategoryBudget}
                    onChange={(e) => setEditCategoryBudget(e.target.value)}
                    className="cyber-input pixel-text"
                    placeholder="Budget"
                    type="number"
                    min="0"
                    required
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
                    onClick={() => setEditingCategoryId(null)}
                    className="cyber-button pixel-text"
                  >
                    Cancel
                  </Button>
                </form>
              ) : (
                <>
                  <span className="pixel-text font-bold">{cat.name}</span>
                  <span className="pixel-text text-sm text-muted-foreground">
                    Budget: {currencyObj.symbol}
                    {cat.budget}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingCategoryId(cat.id);
                      setEditCategoryName(cat.name);
                      setEditCategoryBudget(cat.budget.toString());
                    }}
                    className="cyber-button pixel-text"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      await supabase
                        .from("categories")
                        .delete()
                        .eq("id", cat.id);
                      setCategories(categories.filter((c) => c.id !== cat.id));
                    }}
                    className="cyber-button pixel-text"
                  >
                    Delete
                  </Button>
                </>
              )}
            </li>
          ))}
        </ul>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!newCategory || !newBudget) return;
            const { data, error } = await supabase
              .from("categories")
              .insert({
                user_id: userId,
                name: newCategory,
                budget: parseFloat(newBudget),
              })
              .select();
            if (!error && data) setCategories([...categories, ...data]);
            setNewCategory("");
            setNewBudget("");
          }}
          className="flex gap-2"
        >
          <Input
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="cyber-input pixel-text"
            placeholder="New category"
            required
          />
          <Input
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="cyber-input pixel-text"
            placeholder="Budget"
            type="number"
            min="0"
            required
          />
          <Button type="submit" className="cyber-button pixel-text">
            Add Category
          </Button>
        </form>
      </div>
      {/* Category Progress Bars */}
      <div className="mb-8">
        <h2 className="pixel-text text-lg text-[#ff4500] mb-2">
          Budget Progress
        </h2>
        <ul className="space-y-4">
          {categories.map((cat) => {
            const spent = expenses
              .filter((e) => e.category_id === cat.id)
              .reduce((sum, e) => sum + e.amount, 0);
            const over = spent > cat.budget;
            return (
              <li key={cat.id}>
                <div className="flex justify-between items-center mb-1">
                  <span className="pixel-text font-bold">{cat.name}</span>
                  <span className="pixel-text text-sm">
                    {currencyObj.symbol}
                    {spent.toFixed(2)} / {currencyObj.symbol}
                    {cat.budget}
                  </span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-4 transition-all duration-500 ${
                      over ? "bg-red-500" : "bg-[#ff4500]"
                    }`}
                    style={{
                      width: `${
                        cat.budget > 0
                          ? Math.min((spent / cat.budget) * 100, 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                {over && (
                  <div className="pixel-text text-red-500 text-xs mt-1">
                    ⚠ Over budget!
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
      {/* Expense List Table */}
      <div className="mt-6">
        <h2 className="pixel-text text-xl text-[#ff4500] font-bold mb-2">
          Expenses
        </h2>
        <p className="pixel-text text-xs text-muted-foreground mb-2">
          Below is a list of your expenses. You can search, sort, edit, or
          delete any entry.
        </p>
        <div className="w-full max-w-2xl mx-auto rounded-2xl border border-[#ff4500]/20 bg-white/90 dark:bg-zinc-900/90 shadow-lg overflow-hidden mt-8">
          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={confirmDelete}
            title="Delete Expense?"
            description="Are you sure you want to delete this expense? This action cannot be undone."
            confirmText="Delete"
            cancelText="Cancel"
          />
          <table className="min-w-full">
            <colgroup>
              <col style={{ width: "20%" }} />
              <col style={{ width: "22%" }} />
              <col style={{ width: "18%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "20%" }} />
            </colgroup>
            <thead>
              <tr className="bg-[#1a1a1a] dark:bg-[#2a2a2a] border-b border-[#ff4500]/30">
                <th className="pixel-text text-left px-4 py-3 text-[#ff4500] whitespace-nowrap">
                  Title
                </th>
                <th className="pixel-text text-left px-4 py-3 text-[#ff4500] whitespace-nowrap">
                  Category
                </th>
                <th className="pixel-text text-right px-4 py-3 text-[#ff4500] whitespace-nowrap">
                  Amount
                </th>
                <th className="pixel-text text-center px-4 py-3 text-[#ff4500] whitespace-nowrap">
                  Date
                </th>
                <th className="pixel-text text-center px-4 py-3 text-[#ff4500] whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map((expense, idx) => (
                <tr
                  key={expense.id}
                  className={
                    (idx % 2 === 0
                      ? "bg-[#f5f5f5] dark:bg-[#ff4500]/[0.10]"
                      : "") +
                    " hover:bg-[#ff4500]/10 dark:hover:bg-[#ff4500]/30 transition-colors"
                  }
                >
                  <td className="pixel-text px-4 py-3 whitespace-nowrap text-[#222] dark:text-inherit">
                    {expense.title}
                  </td>
                  <td className="pixel-text px-4 py-3 whitespace-nowrap text-[#222] dark:text-inherit">
                    {categories.find((c) => c.id === expense.category_id)
                      ?.name || "-"}
                  </td>
                  <td className="pixel-text px-4 py-3 text-right text-[#ff4500] whitespace-nowrap">
                    {currencyObj.symbol}
                    {expense.amount.toFixed(2)} {currencyObj.code}
                  </td>
                  <td className="pixel-text px-4 py-3 text-center whitespace-nowrap">
                    {format(new Date(expense.created_at), "MMM d, yyyy")}
                  </td>
                  <td className="pixel-text px-4 py-3 text-center whitespace-nowrap">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(expense.id)}
                        className="cyber-button pixel-text"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
          <div className="flex justify-center mt-8">
            <Button
              variant="default"
              onClick={() => router.push(`/invoice?currency=${currency}`)}
              className="cyber-button pixel-text px-6 py-2 text-base sm:text-lg rounded-xl border-2 border-[#ff4500] hover:bg-[#ff4500]/10 transition-all"
            >
              Check your total expense
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
