"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { currency } from "@/lib/utils";
import type { BudgetItem } from "@/types";

export function BudgetBarChart({ data }: { data: BudgetItem[] }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
          <XAxis dataKey="category" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={56} />
          <YAxis tickFormatter={(value) => currency(Number(value))} width={72} />
          <Tooltip formatter={(value) => currency(Number(value ?? 0))} />
          <Legend />
          <Bar dataKey="estimated_cost" fill="hsl(var(--secondary-foreground))" name="Estimated" radius={[6, 6, 0, 0]} />
          <Bar dataKey="actual_cost" fill="hsl(var(--primary))" name="Actual" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
