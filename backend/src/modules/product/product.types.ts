export interface ProductEntity {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  sku: string;
  isActive: boolean;
  createdBy: number;
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
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  sku?: string;
  isActive?: boolean;
}
