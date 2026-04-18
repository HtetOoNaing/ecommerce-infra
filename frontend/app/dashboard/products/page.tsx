"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { getProducts, deleteProduct, ApiError } from "@/lib/api";
import type { Product, PaginatedResponse } from "@/lib/types";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import ConfirmModal from "@/components/ui/confirm-modal";
import ProductModal from "@/components/products/product-modal";
import { useToast } from "@/lib/toast-context";

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Product> = await getProducts(pageNum, PAGE_SIZE);
      setProducts(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch {
      // handled by API layer
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  // Client-side search (filter current page only for UX)
  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    load(newPage);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget.id);
      toast.success(`"${deleteTarget.name}" deleted`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <TableSkeleton rows={6} cols={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or SKU..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No products found"
          description={search ? "Try a different search term" : "Create your first product to get started"}
          action={
            !search ? (
              <Button icon={<Plus className="w-4 h-4" />} onClick={() => setShowCreate(true)}>
                Add Product
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">SKU</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Price</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Stock</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((product) => (
                    <tr key={product.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                      <td className="px-4 py-3 text-right text-gray-900">${product.price}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{product.stock}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={product.isActive ? "success" : "danger"}>
                          {product.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditProduct(product)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(product)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete ${product.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filtered.length} of {total} products
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      {/* Create / Edit modal */}
      {(showCreate || editProduct) && (
        <ProductModal
          product={editProduct}
          onClose={() => { setShowCreate(false); setEditProduct(null); }}
          onSaved={() => { setShowCreate(false); setEditProduct(null); load(page); }}
        />
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
