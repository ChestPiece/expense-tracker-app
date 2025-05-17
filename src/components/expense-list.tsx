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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [currency, setCurrency] = useState<string>("USD");
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [currencyLoading, setCurrencyLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string>("");
  const [editCategoryId, setEditCategoryId] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryBudget, setEditCategoryBudget] = useState("");
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
    await supabase.from("expenses").delete().eq("id", id);
    fetchExpenses();
  }

  async function handleEdit(id: string) {
    setEditingId(id);
    const expense = expenses.find((e) => e.id === id);
    if (expense) {
      setEditTitle(expense.title);
      setEditAmount(expense.amount.toString());
      setEditCategoryId(expense.category_id || "");
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || !editTitle || !editAmount || !editCategoryId) return;
    await supabase
      .from("expenses")
      .update({
        title: editTitle,
        amount: parseFloat(editAmount),
        category_id: editCategoryId,
      })
      .eq("id", editingId);
    setEditingId(null);
    setEditTitle("");
    setEditAmount("");
    setEditCategoryId("");
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
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
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
