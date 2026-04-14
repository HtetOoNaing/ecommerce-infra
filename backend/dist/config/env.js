"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function getEnv(key, required = true) {
    const value = process.env[key];
    if (!value && required) {
        throw new Error(`❌ Missing environment variable: ${key}`);
    }
    return value;
}
exports.env = {
    NODE_ENV: getEnv("NODE_ENV", false) || "development",
    PORT: parseInt(getEnv("PORT", false) || "4000", 10),
    DATABASE_URL: getEnv("DATABASE_URL"),
    REDIS_URL: getEnv("REDIS_URL"),
};
