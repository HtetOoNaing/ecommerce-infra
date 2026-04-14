"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Check backend/.env and that dotenv is loaded before DB init.");
}
exports.sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    logging: false, // turn on later for debugging
});
const connectDB = async () => {
    try {
        console.log("🔄 Connecting to DB...", process.env.DATABASE_URL);
        await exports.sequelize.authenticate();
        console.log("🟢 DB connected successfully");
    }
    catch (err) {
        console.error("🔴 DB connection failed:", err);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
