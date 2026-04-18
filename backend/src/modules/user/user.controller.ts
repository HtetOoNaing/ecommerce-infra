import { Request, Response } from "express";
import { UserService } from "./user.service";

const service = new UserService();

export class UserController {
  async create(req: Request, res: Response) {
    const user = await service.createUser(req.body);
    res.status(201).json(user);
  }

  async getAll(_req: Request, res: Response) {
    const users = await service.getUsers();
    res.json(users);
  }
}