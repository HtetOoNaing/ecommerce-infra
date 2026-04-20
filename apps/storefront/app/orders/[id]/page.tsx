"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params.id as string;

  // TODO: Fetch order details from API
  const order = {
    id: orderId,
    status: "confirmed",
    total: 299.99,
    items: [
      { name: "Product 1", quantity: 2, price: 99.99 },
      { name: "Product 2", quantity: 1, price: 100.01 },
    ],
    shipping: {
      name: "John Doe",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      zip: "10001",
    },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your purchase. Your order has been received.
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Order Number</span>
              <span className="font-semibold">#{order.id}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">Status</span>
              <span className="font-semibold capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-xl">
                ${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <Link
              href="/products"
              className="block w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Continue Shopping
            </Link>
            <Link
              href="/account/orders"
              className="block w-full text-indigo-600 py-3 hover:text-indigo-800"
            >
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
