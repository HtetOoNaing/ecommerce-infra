import { AppError } from "@/utils/appError";
import { CategoryRepository } from "./category.repository";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryResponseDto,
  CategoryEntity,
  PaginationQuery,
  PaginatedResponse,
} from "./category.types";

export class CategoryService {
  private repo = new CategoryRepository();

  private toResponse(category: CategoryEntity): CategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async create(data: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existingSlug = await this.repo.findBySlug(data.slug);
    if (existingSlug) {
      throw AppError.conflict(`Category with slug "${data.slug}" already exists`);
    }

    const existingName = await this.repo.findByName(data.name);
    if (existingName) {
      throw AppError.conflict(`Category with name "${data.name}" already exists`);
    }

    const category = await this.repo.create(data);
    return this.toResponse(category);
  }

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<CategoryResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.repo.findAll(page, limit);

    return {
      data: result.data.map((c) => this.toResponse(c)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getById(id: number): Promise<CategoryResponseDto> {
    const category = await this.repo.findById(id);
    if (!category) {
      throw AppError.notFound(`Category with id ${id} not found`);
    }
    return this.toResponse(category);
  }

  async getBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.repo.findBySlug(slug);
    if (!category) {
      throw AppError.notFound(`Category with slug "${slug}" not found`);
    }
    return this.toResponse(category);
  }

  async update(id: number, data: UpdateCategoryDto): Promise<CategoryResponseDto> {
    if (data.slug) {
      const existing = await this.repo.findBySlug(data.slug);
      if (existing && existing.id !== id) {
        throw AppError.conflict(`Slug "${data.slug}" is already in use`);
      }
    }

    if (data.name) {
      const existing = await this.repo.findByName(data.name);
      if (existing && existing.id !== id) {
        throw AppError.conflict(`Name "${data.name}" is already in use`);
      }
    }

    const category = await this.repo.update(id, data);
    if (!category) {
      throw AppError.notFound(`Category with id ${id} not found`);
    }
    return this.toResponse(category);
  }

  async delete(id: number): Promise<void> {
    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw AppError.notFound(`Category with id ${id} not found`);
    }
  }
}
