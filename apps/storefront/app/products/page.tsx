import { getProducts, searchProducts } from "@/lib/api/products";
import { ProductCard } from "./ProductCard";
import { Pagination } from "./Pagination";
import type { Product } from "@infrapro/shared-types";

// Server Component - fetches data on the server
// Revalidate every 60 seconds for fresh product listings
export const revalidate = 60;

interface ProductsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) : 1;
  const limit = 12;

  let products: Product[] = [];
  let totalPages = 1;

  try {
    const response = query
      ? await searchProducts(query, page, limit)
      : await getProducts(page, limit);
    products = response.data;
    totalPages = Math.ceil(response.total / limit);
  } catch (err) {
    // Log error for debugging
    console.error("Failed to fetch products:", err);
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {query ? `Search results for "${query}"` : "All Products"}
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No products found.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              query={query}
            />
          </>
        )}
      </div>
    </main>
  );
}
