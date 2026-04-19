import { Order, OrderItem } from "./order.model";
import { User } from "@/modules/user/user.model";
import { Product } from "@/modules/product/product.model";
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderEntity,
  OrderItemEntity,
  PaginatedResponse,
} from "./order.types";

export class OrderRepository {
  async create(data: CreateOrderDto, totalAmount: number): Promise<OrderEntity> {
    const order = await Order.create({
      userId: data.userId,
      totalAmount,
      shippingAddress: data.shippingAddress,
      billingAddress: data.billingAddress ?? null,
      notes: data.notes ?? null,
    });

    // Create order items
    await Promise.all(
      data.items.map((item) =>
        OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: 0, // Will be populated from product price
        })
      )
    );

    return this.findById(order.id) as Promise<OrderEntity>;
  }

  async findAll(page: number, limit: number): Promise<PaginatedResponse<OrderEntity>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Order.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "name"],
        },
      ],
    });

    return {
      data: rows.map((o) => this.toEntity(o)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async findById(id: number): Promise<OrderEntity | null> {
    const order = await Order.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "name"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "sku"],
            },
          ],
        },
      ],
    });

    return order ? this.toEntity(order) : null;
  }

  async findByUserId(userId: number, page: number, limit: number): Promise<PaginatedResponse<OrderEntity>> {
    const offset = (page - 1) * limit;
    const { count, rows } = await Order.findAndCountAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: Product,
              as: "product",
              attributes: ["id", "name", "sku"],
            },
          ],
        },
      ],
    });

    return {
      data: rows.map((o) => this.toEntity(o)),
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async update(id: number, data: UpdateOrderDto): Promise<OrderEntity | null> {
    const order = await Order.findByPk(id);
    if (!order) return null;

    await order.update(data);
    return this.findById(id);
  }

  async delete(id: number): Promise<boolean> {
    const deleted = await Order.destroy({ where: { id } });
    return deleted > 0;
  }

  private toEntity(order: Order): OrderEntity {
    const plain = order.toJSON() as OrderEntity & { user?: User; items?: (OrderItem & { product?: Product })[] };

    return {
      id: plain.id,
      userId: plain.userId,
      status: plain.status,
      paymentStatus: plain.paymentStatus,
      totalAmount: parseFloat(String(plain.totalAmount)),
      shippingAddress: plain.shippingAddress,
      billingAddress: plain.billingAddress,
      notes: plain.notes,
      user: plain.user,
      items: plain.items?.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: parseFloat(String(item.unitPrice)),
        product: item.product,
        createdAt: item.createdAt!,
        updatedAt: item.updatedAt!,
      })),
      createdAt: plain.createdAt!,
      updatedAt: plain.updatedAt!,
    };
  }
}
