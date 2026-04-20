export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}

export interface ProductEntity {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  createdBy: number;
  categoryId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductResponseDto {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  createdBy: number;
  categoryId: number | null;
  category?: CategoryInfo | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  createdBy: number;
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

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
