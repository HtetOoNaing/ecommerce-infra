import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).optional(),
  price: z.number().positive("Price must be positive").max(999999.99),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z
    .string()
    .min(3, "SKU must be at least 3 characters")
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/, "SKU must be alphanumeric with hyphens only"),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().positive().max(999999.99).optional(),
  stock: z.number().int().min(0).optional(),
  sku: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[A-Za-z0-9-]+$/)
    .optional(),
  isActive: z.boolean().optional(),
});
