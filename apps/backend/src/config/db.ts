import { Sequelize } from "sequelize";


if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Check backend/.env and that dotenv is loaded before DB init.");
}

export const sequelize = new Sequelize(
  process.env.DATABASE_URL,
  {
    dialect: "postgres",
    logging: false, // turn on later for debugging
  }
);

export const connectDB = async () => {
  try {
    console.log("🔄 Connecting to DB...");
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    console.log("🟢 DB connected successfully");
  } catch (err) {
    console.error("🔴 DB connection failed:", err);
    process.exit(1);
  }
};