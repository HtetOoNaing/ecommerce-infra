import { Product } from "./product.model";
import { CreateProductDto, UpdateProductDto, ProductEntity } from "./product.types";

export class ProductRepository {
  async create(data: CreateProductDto): Promise<ProductEntity> {
    const product = await Product.create(data);
    return product.toJSON() as ProductEntity;
  }

  async findAll(): Promise<ProductEntity[]> {
    const products = await Product.findAll({ order: [["createdAt", "DESC"]] });
    return products.map((p) => p.toJSON() as ProductEntity);
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
