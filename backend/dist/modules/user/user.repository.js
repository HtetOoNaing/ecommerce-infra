"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const user_model_1 = require("./user.model");
class UserRepository {
    async create(data) {
        return user_model_1.User.create(data);
    }
    async findAll() {
        return user_model_1.User.findAll();
    }
    async findByEmail(email) {
        return user_model_1.User.findOne({ where: { email } });
    }
    async findById(id) {
        return user_model_1.User.findByPk(id);
    }
}
exports.UserRepository = UserRepository;
