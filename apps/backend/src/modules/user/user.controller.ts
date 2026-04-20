import { Request, Response } from "express";
import { UserService } from "./user.service";
import { PaginationQuery } from "./user.types";

const service = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    const user = await service.createUser(req.body);
    res.status(201).json(user);
  }

  async getAll(req: Request, res: Response) {
    const users = await service.getUsers(req.query as PaginationQuery);
    res.json(users);
  }
}