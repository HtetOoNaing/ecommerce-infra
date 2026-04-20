"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCustomerAuth } from "@/lib/context/CustomerAuthContext";
import { useRouter } from "next/navigation";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

export default function OrderHistoryPage() {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
      return;
    }

    // TODO: Fetch orders from API
    // For now, show mock data
    setOrders([
      {
        id: "123",
        status: "delivered",
        total: 299.99,
        createdAt: "2024-01-15",
        items: [{ name: "Product 1", quantity: 2 }],
      },
      {
        id: "124",
        status: "processing",
        total: 149.99,
        createdAt: "2024-01-20",
        items: [{ name: "Product 2", quantity: 1 }],
      },
    ]);
    setLoading(false);
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg h-32" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 mb-4">No orders yet.</p>
            <Link
              href="/products"
              className="text-indigo-600 hover:text-indigo-800"
            >
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition"
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                    <p className="mt-1 font-bold">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    {order.items.map((item) => (
                      <span key={item.name}>
                        {item.name} x {item.quantity}
                      </span>
                    ))}
                  </p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
