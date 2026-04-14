process.env.NODE_ENV = "test";
process.env.PORT = "4001";
process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/ecommerce_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.JWT_ACCESS_SECRET = "test-access-secret-at-least-32-chars-long";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-at-least-32-chars-long";
process.env.ACCESS_TOKEN_EXPIRES = "15m";
process.env.REFRESH_TOKEN_EXPIRES = "7d";
