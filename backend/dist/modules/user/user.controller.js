"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const service = new user_service_1.UserService();
class UserController {
    async create(req, res, next) {
        try {
            const user = await service.createUser(req.body);
            res.status(201).json(user);
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(_req, res, next) {
        try {
            const users = await service.getUsers();
            res.json(users);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.UserController = UserController;
