// Re-export all shared types from the canonical package.
// Import from "@/lib/types" as before — this re-export keeps existing imports working.
export type {
  UserRole,
  AuthUser,
  AuthTokens,
  LoginResponse,
  RegisterResponse,
  User,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryInfo,
  Product,
  CreateProductDto,
  UpdateProductDto,
  PaginatedResponse,
  OrderStatus,
  PaymentStatus,
  OrderItem,
  Order,
  CreateOrderDto,
  UpdateOrderDto,
} from "@infrapro/shared-types";

// ─── Admin-only types ─────────────────────────────────

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  verifiedUsers: number;
}
