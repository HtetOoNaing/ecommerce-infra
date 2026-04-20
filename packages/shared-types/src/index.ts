// ─── Auth ────────────────────────────────────────────
export type UserRole = "user" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

// ─── User ────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  name?: string | null;
  role: UserRole;
  isVerified: boolean;
}

// ─── Category ──────────────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
}

// ─── Product ─────────────────────────────────────────
export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  createdBy: number;
  categoryId?: number | null;
  category?: CategoryInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  categoryId?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  isActive?: boolean;
  categoryId?: number | null;
}

// ─── Pagination ──────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Order ───────────────────────────────────────────
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  product?: {
    id: number;
    name: string;
    sku: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  shippingAddress: string;
  billingAddress: string | null;
  notes: string | null;
  items: OrderItem[];
  user?: {
    id: number;
    email: string;
    name?: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  userId: number;
  items: { productId: number; quantity: number }[];
  shippingAddress: string;
  billingAddress?: string;
  notes?: string;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  shippingAddress?: string;
  billingAddress?: string | null;
  notes?: string | null;
}
