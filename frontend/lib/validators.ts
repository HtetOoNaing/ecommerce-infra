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
