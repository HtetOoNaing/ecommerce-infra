"use client";

import { useEffect, useState } from "react";
import { Users, Package, CheckCircle, ShieldCheck } from "lucide-react";
import { getUsers, getProducts } from "@/lib/api";
import type { User, Product } from "@/lib/types";
import { TableSkeleton } from "@/components/ui/skeleton";
import StatsCard from "@/components/dashboard/stats-card";
import OverviewChart from "@/components/dashboard/overview-chart";
import ProductStatusChart from "@/components/dashboard/product-status-chart";

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [usersRes, productsRes] = await Promise.all([getUsers(), getProducts()]);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
      } catch {
        // toasts handled by API layer
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, color: "bg-blue-500" },
    { label: "Total Products", value: products.length, icon: Package, color: "bg-indigo-500" },
    { label: "Active Products", value: products.filter((p) => p.isActive).length, icon: CheckCircle, color: "bg-emerald-500" },
    { label: "Verified Users", value: users.filter((u) => u.isVerified).length, icon: ShieldCheck, color: "bg-amber-500" },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
        <TableSkeleton rows={4} cols={3} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.label} {...s} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
          <OverviewChart users={users} products={products} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h2>
          <ProductStatusChart products={products} />
        </div>
      </div>
    </div>
  );
}
