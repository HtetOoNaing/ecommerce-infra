import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.number().int().positive("Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  userId: z.number().int().positive("User ID is required"),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: z.string().min(1, "Shipping address is required").max(500),
  billingAddress: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  shippingAddress: z.string().min(1).max(500).optional(),
  billingAddress: z.string().max(500).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
