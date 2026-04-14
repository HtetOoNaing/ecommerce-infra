import { AppError } from "@/utils/appError";
import { ProductRepository } from "./product.repository";
import {
  CreateProductDto,
  UpdateProductDto,
  ProductResponseDto,
  ProductEntity,
} from "./product.types";

export class ProductService {
  private repo = new ProductRepository();

  private toResponse(product: ProductEntity): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      sku: product.sku,
      isActive: product.isActive,
      createdBy: product.createdBy,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async create(data: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.repo.findBySku(data.sku);
    if (existing) {
      throw AppError.conflict(`Product with SKU "${data.sku}" already exists`);
    }

    const product = await this.repo.create(data);
    return this.toResponse(product);
  }

  async getAll(): Promise<ProductResponseDto[]> {
    const products = await this.repo.findAll();
    return products.map((p) => this.toResponse(p));
  }

  async getById(id: number): Promise<ProductResponseDto> {
    const product = await this.repo.findById(id);
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
