import { Product } from "./product.model";
import { CreateProductDto, UpdateProductDto, ProductEntity, PaginatedResponse } from "./product.types";

export class ProductRepository {
  async create(data: CreateProductDto): Promise<ProductEntity> {
    const product = await Product.create(data);
    return product.toJSON() as ProductEntity;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResponse<ProductEntity>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Product.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    return {
      data: rows.map((p) => p.toJSON() as ProductEntity),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: number): Promise<ProductEntity | null> {
    const product = await Product.findByPk(id);
    return product ? (product.toJSON() as ProductEntity) : null;
  }

  async findBySku(sku: string): Promise<ProductEntity | null> {
    const product = await Product.findOne({ where: { sku } });
    return product ? (product.toJSON() as ProductEntity) : null;
  }

  async update(id: number, data: UpdateProductDto): Promise<ProductEntity | null> {
    const product = await Product.findByPk(id);
    if (!product) return null;

    await product.update(data);
    return product.toJSON() as ProductEntity;
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await Product.destroy({ where: { id } });
    return deleted > 0;
  }
}
