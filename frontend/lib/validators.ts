/**
 * Zod Validation Schemas
 * Contract tests to ensure API responses match expected structure
 */
import { z } from "zod";

// ─── Auth Schemas ─────────────────────────────────────
export const AuthUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: z.enum(["admin", "user"]),
  isVerified: z.boolean(),
});

export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const RegisterResponseSchema = LoginResponseSchema;

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});

// ─── User Schemas ───────────────────────────────────
export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().nullable().optional(),
  role: z.enum(["admin", "user"]),
  isVerified: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// ─── Pagination Schema ───────────────────────────────
export function createPaginatedResponseSchema<T>(itemSchema: z.ZodSchema<T>) {
  return z.object({
    data: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  });
}

export const UsersListSchema = createPaginatedResponseSchema(UserSchema);

// ─── Category Schemas ─────────────────────────────────
export const CategorySchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const CategoriesListSchema = createPaginatedResponseSchema(CategorySchema);

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
});

export const UpdateCategorySchema = CreateCategorySchema.partial();

// ─── Product Schemas ──────────────────────────────────
export const CategoryInfoSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
});

export const ProductSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  description: z.string().optional().nullable(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
  createdBy: z.number().int(),
  categoryId: z.number().nullable().optional(),
  category: CategoryInfoSchema.nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const ProductsListSchema = createPaginatedResponseSchema(ProductSchema);

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  sku: z.string().min(1).max(100),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  categoryId: z.number().optional(),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  sku: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  categoryId: z.number().nullable().optional(),
});

// ─── Order Schemas ──────────────────────────────────
export const OrderItemSchema = z.object({
  id: z.number(),
  productId: z.number(),
  quantity: z.number().int().min(1),
  unitPrice: z.number(),
  product: z.object({
    id: z.number(),
    name: z.string(),
    sku: z.string(),
  }).optional(),
});

export const OrderSchema = z.object({
  id: z.number(),
  userId: z.number(),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]),
  totalAmount: z.number(),
  shippingAddress: z.string(),
  billingAddress: z.string().nullable(),
  notes: z.string().nullable(),
  items: z.array(OrderItemSchema),
  user: z.object({
    id: z.number(),
    email: z.string().email(),
    name: z.string().nullable().optional(),
  }).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const OrdersListSchema = createPaginatedResponseSchema(OrderSchema);

export const CreateOrderSchema = z.object({
  userId: z.number().int().positive(),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().min(1),
  })).min(1),
  shippingAddress: z.string().min(1).max(500),
  billingAddress: z.string().optional(),
  notes: z.string().optional(),
});

export const UpdateOrderSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
  paymentStatus: z.enum(["pending", "paid", "failed", "refunded"]).optional(),
  shippingAddress: z.string().min(1).max(500).optional(),
  billingAddress: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// ─── API Error Schema ────────────────────────────────
export const ApiErrorSchema = z.object({
  message: z.string(),
  errors: z
    .array(
      z.object({
        message: z.string(),
        path: z.array(z.string()).optional(),
      })
    )
    .optional(),
});

// ─── Helper: Validate API Response ─────────────────
export function validateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  return schema.parse(data);
}

export function safeValidateResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}
