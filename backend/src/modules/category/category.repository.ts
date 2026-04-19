import { Category } from "./category.model";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryEntity,
  PaginatedResponse,
} from "./category.types";

export class CategoryRepository {
  async create(data: CreateCategoryDto): Promise<CategoryEntity> {
    const category = await Category.create(data);
    return category.toJSON() as CategoryEntity;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResponse<CategoryEntity>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Category.findAndCountAll({
      order: [["name", "ASC"]],
      limit,
      offset,
    });

    return {
      data: rows.map((c) => c.toJSON() as CategoryEntity),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: number): Promise<CategoryEntity | null> {
    const category = await Category.findByPk(id);
    return category ? (category.toJSON() as CategoryEntity) : null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const category = await Category.findOne({ where: { slug } });
    return category ? (category.toJSON() as CategoryEntity) : null;
  }

  async findByName(name: string): Promise<CategoryEntity | null> {
    const category = await Category.findOne({ where: { name } });
    return category ? (category.toJSON() as CategoryEntity) : null;
  }

  async update(id: number, data: UpdateCategoryDto): Promise<CategoryEntity | null> {
    const category = await Category.findByPk(id);
    if (!category) return null;

    await category.update(data);
    return category.toJSON() as CategoryEntity;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await Category.destroy({ where: { id } });
    return deleted > 0;
  }
}
