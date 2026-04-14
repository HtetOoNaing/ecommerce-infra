"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const db_1 = require("./config/db");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use("/api/users", user_routes_1.default);
// Health check
app.get("/health", (_req, res) => {
    res.json({ status: "OK" });
});
(0, db_1.connectDB)();
// Error handler (must be last)
app.use(error_middleware_1.errorHandler);
exports.default = app;
