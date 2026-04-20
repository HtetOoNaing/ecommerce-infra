import { Request, Response } from "express";
import { OrderService } from "./order.service";
import { PaginationQuery } from "./order.types";

const service = new OrderService();

export class OrderController {
  async getAll(req: Request, res: Response) {
    const query = req.query as unknown as PaginationQuery;
    const orders = await service.getAll(query);
    res.json(orders);
  }

  async getById(req: Request, res: Response) {
    const order = await service.getById(Number(req.params.id));
    res.json(order);
  }

  async getByUserId(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const query = req.query as unknown as PaginationQuery;
    const orders = await service.getByUserId(userId, query);
    res.json(orders);
  }

  async create(req: Request, res: Response) {
    const order = await service.create(req.body);
    res.status(201).json(order);
  }

  async update(req: Request, res: Response) {
    const order = await service.update(Number(req.params.id), req.body);
    res.json(order);
  }

  async delete(req: Request, res: Response) {
    await service.delete(Number(req.params.id));
    res.status(204).send();
  }
}
