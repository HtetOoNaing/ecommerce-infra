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
