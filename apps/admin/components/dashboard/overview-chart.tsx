"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { User, Product } from "@/lib/types";

interface Props {
  users: User[];
  products: Product[];
}

export default function OverviewChart({ users, products }: Props) {
  const data = [
    { name: "Users", total: users.length, verified: users.filter((u) => u.isVerified).length },
    { name: "Products", total: products.length, active: products.filter((p) => p.isActive).length },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barGap={8}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 13 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }}
        />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total" />
        <Bar dataKey="verified" fill="#10b981" radius={[4, 4, 0, 0]} name="Verified" />
        <Bar dataKey="active" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Active" />
      </BarChart>
    </ResponsiveContainer>
  );
}
