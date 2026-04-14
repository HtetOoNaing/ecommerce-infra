import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";

const service = new UserService();

export class UserController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await service.createUser(req.body);
      res.status(201).json(user);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await service.getUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  }
}