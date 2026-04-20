"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Pencil, Trash2, Package } from "lucide-react";
import { getOrders, deleteOrder, ApiError } from "@/lib/api";
import type { Order, PaginatedResponse, OrderStatus, PaymentStatus } from "@/lib/types";
import Badge from "@/components/ui/badge";
import Pagination from "@/components/ui/pagination";
import { TableSkeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import ConfirmModal from "@/components/ui/confirm-modal";
import { useToast } from "@/lib/toast-context";

const PAGE_SIZE = 8;

const statusVariants: Record<OrderStatus, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  processing: "info",
  shipped: "default",
  delivered: "success",
  cancelled: "danger",
};

const paymentStatusVariants: Record<PaymentStatus, "default" | "success" | "warning" | "danger"> = {
  pending: "warning",
  paid: "success",
  failed: "danger",
  refunded: "default",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  const load = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const response: PaginatedResponse<Order> = await getOrders(pageNum, PAGE_SIZE);
      setOrders(response.data);
      setTotalPages(response.totalPages);
      setTotal(response.total);
    } catch {
      // handled by API layer
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1); }, [load]);

  // Client-side search
  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (o.user?.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
          o.status.toLowerCase().includes(search.toLowerCase()) ||
          o.paymentStatus.toLowerCase().includes(search.toLowerCase()) ||
          String(o.id).includes(search)
      ),
    [orders, search]
  );

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    load(newPage);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteOrder(deleteTarget.id);
      toast.success(`Order #${deleteTarget.id} deleted`);
      setOrders((prev) => prev.filter((o) => o.id !== deleteTarget.id));
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
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by ID, email, or status..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={search ? "Try a different search term" : "Orders will appear here when customers make purchases"}
          icon={<Package className="w-12 h-12 text-gray-300" />}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Order ID</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Customer</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-500">Payment</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Items</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex flex-col">
                          <span className="font-medium">{order.user?.email ?? "Unknown"}</span>
                          {order.user?.name && <span className="text-xs text-gray-400">{order.user.name}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={statusVariants[order.status]}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={paymentStatusVariants[order.paymentStatus]}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="text-xs">{order.items.length} item(s)</span>
                        <div className="text-xs text-gray-400 truncate max-w-[150px]">
                          {order.items.map(i => i.product?.name ?? "Unknown").join(", ")}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            aria-label={`Edit order ${order.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(order)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label={`Delete order ${order.id}`}
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
              Showing {filtered.length} of {total} orders
            </p>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </>
      )}

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Order"
        description={`Are you sure you want to delete Order #${deleteTarget?.id}? This action cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
