import { Response } from "express";
import { ProductService } from "./product.service";
import { AuthRequest } from "@/middlewares/auth.middleware";
import { PaginationQuery } from "./product.types";

const service = new ProductService();

export class ProductController {
  async create(req: AuthRequest, res: Response) {
    const product = await service.create({ ...req.body, createdBy: req.user!.id });
    res.status(201).json(product);
  }

  async getAll(req: AuthRequest, res: Response) {
    const products = await service.getAll(req.query as PaginationQuery);
    res.json(products);
  }

  async getById(req: AuthRequest, res: Response) {
    const product = await service.getById(Number(req.params.id));
    res.json(product);
  }

  async update(req: AuthRequest, res: Response) {
    const product = await service.update(Number(req.params.id), req.body);
    res.json(product);
  }

  async delete(req: AuthRequest, res: Response) {
    await service.delete(Number(req.params.id));
    res.status(204).send();
  }
}
