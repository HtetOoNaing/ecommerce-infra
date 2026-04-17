"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { createProduct, updateProduct, ApiError } from "@/lib/api";
import { useToast } from "@/lib/toast-context";
import type { Product } from "@/lib/types";

interface Props {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function ProductModal({ product, onClose, onSaved }: Props) {
  const isEdit = !!product;
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [stock, setStock] = useState(product?.stock?.toString() ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        description: description || undefined,
        price: parseFloat(price),
        stock: parseInt(stock, 10),
        sku,
      };

      if (isEdit) {
        await updateProduct(product.id, payload);
        toast.success(`"${name}" updated`);
      } else {
        await createProduct(payload);
        toast.success(`"${name}" created`);
      }
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => e.target === overlayRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 animate-scale-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            <Input label="Stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} required />
          </div>
          <Input label="SKU" value={sku} onChange={(e) => setSku(e.target.value)} required />

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" isLoading={loading}>
              {isEdit ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
