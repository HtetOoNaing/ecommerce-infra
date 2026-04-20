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
