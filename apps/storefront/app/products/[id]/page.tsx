import { notFound } from "next/navigation";
import Link from "next/link";
import { getProduct } from "@/lib/api/products";
import { AddToCartButton } from "./AddToCartButton";
import type { Metadata } from "next";

// ISR: Revalidate product pages every 60 seconds
export const revalidate = 60;

// Allow on-demand generation for product IDs not in generateStaticParams
export const dynamicParams = true;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const BASE_URL = "https://infra-pro.com";

  try {
    const product = await getProduct(parseInt(id));
    const productUrl = `${BASE_URL}/products/${product.id}`;

    return {
      title: `${product.name} | InfraPro Store`,
      description: product.description ?? undefined,
      alternates: {
        canonical: productUrl,
      },
      openGraph: {
        title: product.name,
        description: product.description ?? undefined,
        url: productUrl,
        siteName: "InfraPro Store",
        type: "website",
        images: [
          {
            url: product.images?.[0]?.url || `${BASE_URL}/og-default.jpg`,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description ?? undefined,
        images: [product.images?.[0]?.url || `${BASE_URL}/og-default.jpg`],
      },
    };
  } catch {
    return {
      title: "Product Not Found | InfraPro Store",
    };
  }
}

export async function generateStaticParams() {
  // Pre-render first 10 products at build time
  try {
    const { getProducts } = await import("@/lib/api/products");
    const response = await getProducts(1, 10);
    return response.data.map((product) => ({
      id: product.id.toString(),
    }));
  } catch {
    return [];
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  let product;

  try {
    product = await getProduct(parseInt(id));
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          href="/products"
          className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block"
        >
          ← Back to Products
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Product Image */}
            <div className="aspect-square bg-gray-200 relative">
              {product.images?.[0]?.url ? (
                <img
                  src={product.images[0].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-6">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-indigo-600 mb-6">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Stock:</span>
                  <span
                    className={`font-semibold ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                  </span>
                </div>

                {product.category && (
                  <div className="flex items-center gap-4">
                    <span className="text-gray-600">Category:</span>
                    <Link
                      href={`/products?category=${product.category.id}`}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      {product.category.name}
                    </Link>
                  </div>
                )}

                <AddToCartButton
                  product={{
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images?.[0]?.url,
                    stock: product.stock,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
