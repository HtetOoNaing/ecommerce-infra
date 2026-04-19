import { AppError } from "@/utils/appError";
import { OrderRepository } from "./order.repository";
import { ProductRepository } from "@/modules/product/product.repository";
import { UserRepository } from "@/modules/user/user.repository";
import {
  CreateOrderDto,
  UpdateOrderDto,
  OrderResponseDto,
  OrderEntity,
  PaginationQuery,
  PaginatedResponse,
  OrderItemResponseDto,
} from "./order.types";

export class OrderService {
  private repo = new OrderRepository();
  private productRepo = new ProductRepository();
  private userRepo = new UserRepository();

  private toResponse(order: OrderEntity): OrderResponseDto {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      notes: order.notes,
      items: order.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        product: item.product,
      })) ?? [],
      user: order.user,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async create(data: CreateOrderDto): Promise<OrderResponseDto> {
    // Verify user exists
    const user = await this.userRepo.findById(data.userId);
    if (!user) {
      throw AppError.notFound(`User with id ${data.userId} not found`);
    }

    // Verify all products exist and have sufficient stock
    let totalAmount = 0;
    const itemsWithPrice: { productId: number; quantity: number; unitPrice: number }[] = [];

    for (const item of data.items) {
      const product = await this.productRepo.findById(item.productId);
      if (!product) {
        throw AppError.notFound(`Product with id ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw AppError.badRequest(`Product "${product.name}" is not available`);
      }
      if (product.stock < item.quantity) {
        throw AppError.badRequest(
          `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`
        );
      }

      const unitPrice = product.price;
      totalAmount += unitPrice * item.quantity;
      itemsWithPrice.push({ ...item, unitPrice });
    }

    // Create order with calculated total
    const order = await this.repo.create(
      { ...data, items: itemsWithPrice },
      totalAmount
    );

    // Update product stock (decrement)
    for (const item of itemsWithPrice) {
      const product = await this.productRepo.findById(item.productId);
      if (product) {
        await this.productRepo.update(item.productId, {
          stock: product.stock - item.quantity,
        });
      }
    }

    return this.toResponse(order);
  }

  async getAll(query: PaginationQuery): Promise<PaginatedResponse<OrderResponseDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.repo.findAll(page, limit);

    return {
      data: result.data.map((o) => this.toResponse(o)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async getById(id: number): Promise<OrderResponseDto> {
    const order = await this.repo.findById(id);
    if (!order) {
      throw AppError.notFound(`Order with id ${id} not found`);
    }
    return this.toResponse(order);
  }

  async getByUserId(
    userId: number,
    query: PaginationQuery
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    // Verify user exists
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound(`User with id ${userId} not found`);
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const result = await this.repo.findByUserId(userId, page, limit);

    return {
      data: result.data.map((o) => this.toResponse(o)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async update(id: number, data: UpdateOrderDto): Promise<OrderResponseDto> {
    const order = await this.repo.update(id, data);
    if (!order) {
      throw AppError.notFound(`Order with id ${id} not found`);
    }
    return this.toResponse(order);
  }

  async delete(id: number): Promise<void> {
    const order = await this.repo.findById(id);
    if (!order) {
      throw AppError.notFound(`Order with id ${id} not found`);
    }

    // Restore product stock for cancelled/pending orders
    if (order.status === "pending" || order.status === "processing") {
      for (const item of order.items ?? []) {
        const product = await this.productRepo.findById(item.productId);
        if (product) {
          await this.productRepo.update(item.productId, {
            stock: product.stock + item.quantity,
          });
        }
      }
    }

    const deleted = await this.repo.delete(id);
    if (!deleted) {
      throw AppError.notFound(`Order with id ${id} not found`);
    }
  }
}
