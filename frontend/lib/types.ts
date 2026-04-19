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

// ─── API Error ───────────────────────────────────────
export interface ApiError {
  message: string;
  errors?: Array<{ message: string; path?: string[] }>;
}

// ─── Dashboard Stats ─────────────────────────────────
export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  verifiedUsers: number;
}
