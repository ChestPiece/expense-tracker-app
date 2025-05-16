import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import React from "react";

Chart.register(ArcElement, Tooltip, Legend);

interface Category {
  id: string;
  name: string;
  budget: number;
}

interface Expense {
  id: string;
  amount: number;
  category_id?: string;
}

export function CategoryPieChart({
  categories,
  expenses,
}: {
  categories: Category[];
  expenses: Expense[];
}) {
  const data = {
    labels: categories.map((cat) => cat.name),
    datasets: [
      {
        data: categories.map((cat) =>
          expenses
            .filter((e) => e.category_id === cat.id)
            .reduce((sum, e) => sum + e.amount, 0)
        ),
        backgroundColor: [
          "#ff4500",
          "#ff9800",
          "#00bcd4",
          "#8bc34a",
          "#e91e63",
          "#9c27b0",
          "#03a9f4",
          "#cddc39",
          "#ffc107",
          "#607d8b",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: 300, height: 300 }}>
      <Pie data={data} />
    </div>
  );
}
