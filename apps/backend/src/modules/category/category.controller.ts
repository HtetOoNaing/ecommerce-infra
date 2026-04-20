import { Request, Response } from "express";
import { CategoryService } from "./category.service";
import { PaginationQuery } from "./category.types";

const service = new CategoryService();

export class CategoryController {
  async getAll(req: Request, res: Response) {
    const query = req.query as unknown as PaginationQuery;
    const categories = await service.getAll(query);
    res.json(categories);
  }

  async getById(req: Request, res: Response) {
    const category = await service.getById(Number(req.params.id));
    res.json(category);
  }

  async getBySlug(req: Request, res: Response) {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const category = await service.getBySlug(slug);
    res.json(category);
  }

  async create(req: Request, res: Response) {
    const category = await service.create(req.body);
    res.status(201).json(category);
  }

  async update(req: Request, res: Response) {
    const category = await service.update(Number(req.params.id), req.body);
    res.json(category);
  }

  async delete(req: Request, res: Response) {
    await service.delete(Number(req.params.id));
    res.status(204).send();
  }
}
