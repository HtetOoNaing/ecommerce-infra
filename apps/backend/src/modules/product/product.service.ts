import { AppError } from "@/utils/appError";
import { ProductRepository } from "./product.repository";
import { CategoryRepository } from "@/modules/category/category.repository";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductEntity,
  PaginationQuery,
  PaginatedResponse,
  CategoryInfo,
} from "./product.types";

export class ProductService {
  private repo = new ProductRepository();
  private categoryRepo = new CategoryRepository();

  private async toResponse(product: ProductEntity & { category?: { id: number; name: string; slug: string } | null }): Promise<ProductResponseDto> {
    let category: CategoryInfo | null = null;
    if (product.category) {
      category = {
        id: product.category.id,
        name: product.category.name,
        slug: product.category.slug,
      };
    } else if (product.categoryId) {
      const cat = await this.categoryRepo.findById(product.categoryId);
      if (cat) {
        category = {
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        };
      }
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      isActive: product.isActive,
      createdBy: product.createdBy,
      categoryId: product.categoryId,
      category,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(data: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.repo.findBySku(data.sku);
    if (existing) {
      throw AppError.conflict(`Product with SKU "${data.sku}" already exists`);
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw AppError.notFound(`Category with id ${data.categoryId} not found`);
      }
    }

    const product = await this.repo.create(data);
    return this.toResponse(product);
  }

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<ProductResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.repo.findAll(page, limit);

    const productsWithCategory = await Promise.all(
      result.data.map((p) => this.toResponse(p))
    );

    return {
      data: productsWithCategory,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getById(id: number): Promise<ProductResponseDto> {
    const product = await this.repo.findByIdWithCategory(id);
    if (!product) {
      throw AppError.notFound(`Product with id ${id} not found`);
    }
    return this.toResponse(product);
  }

  async update(id: number, data: UpdateProductDto): Promise<ProductResponseDto> {
    if (data.sku) {
      const existing = await this.repo.findBySku(data.sku);
      if (existing && existing.id !== id) {
        throw AppError.conflict(`SKU "${data.sku}" is already in use`);
      }
    }

    if (data.categoryId) {
      const category = await this.categoryRepo.findById(data.categoryId);
      if (!category) {
        throw AppError.notFound(`Category with id ${data.categoryId} not found`);
      }
    }

    const product = await this.repo.update(id, data);
    if (!product) {
      throw AppError.notFound(`Product with id ${id} not found`);
    }
    return this.toResponse(product);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw AppError.notFound(`Product with id ${id} not found`);
    }
  }
}
