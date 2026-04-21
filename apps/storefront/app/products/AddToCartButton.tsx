"use client";

import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    stock: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-500 py-2 rounded font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      className={`w-full py-2 rounded font-semibold transition ${
        added
          ? "bg-green-600 text-white"
          : "bg-indigo-600 text-white hover:bg-indigo-700"
      }`}
    >
      {added ? "Added!" : "Add to Cart"}
    </button>
  );
}
