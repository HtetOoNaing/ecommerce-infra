import Link from "next/link";
import { AddToCartButton } from "./AddToCartButton";
import type { Product } from "@infrapro/shared-types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <Link href={`/products/${product.id}`}>
        <div className="h-48 bg-gray-200 relative">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold hover:text-indigo-600">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-600 text-sm mt-1 line-clamp-2">
          {product.description}
        </p>
        <div className="mt-4">
          <span className="text-lg font-bold text-indigo-600">
            ${Number(product.price).toFixed(2)}
          </span>
        </div>
        <div className="mt-3">
          <AddToCartButton
            product={{
              id: product.id,
              name: product.name,
              price: product.price,
              stock: product.stock,
            }}
          />
        </div>
      </div>
    </div>
  );
}
