"use client";

import { useState } from "react";
import { useCart } from "@/lib/context/CartContext";

interface AddToCartButtonProps {
  product: {
    id: number;
    name: string;
    price: number;
    image?: string;
    stock: number;
  };
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleAdd = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (product.stock <= 0) {
    return (
      <button
        disabled
        className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex items-center border rounded-lg">
        <button
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          className="px-3 py-2 hover:bg-gray-100"
          disabled={quantity <= 1}
        >
          -
        </button>
        <span className="px-4 py-2 font-semibold">{quantity}</span>
        <button
          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
          className="px-3 py-2 hover:bg-gray-100"
          disabled={quantity >= product.stock}
        >
          +
        </button>
      </div>
      <button
        onClick={handleAdd}
        className={`flex-1 py-3 rounded-lg font-semibold transition ${
          added
            ? "bg-green-600 text-white"
            : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        {added ? "Added!" : "Add to Cart"}
      </button>
    </div>
  );
}
