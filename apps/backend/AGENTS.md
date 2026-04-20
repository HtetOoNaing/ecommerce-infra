<!-- BEGIN:project-rules -->
# InfraPro Backend — AI Agent Guidelines

## Critical: Express 5 + TypeScript

This project uses **Express 5** with **TypeScript 5** and **Sequelize 6**.

⚠️ **Express 5 handles async errors automatically — no try/catch needed in controllers!**
- Thrown errors in async route handlers propagate to `errorHandler` automatically
- Do NOT wrap controller methods in try/catch
- Always check official docs before assuming Express 4 patterns

## Project Architecture

### Stack
- **Framework**: Express 5
- **Language**: TypeScript 5 (strict mode)
- **ORM**: Sequelize 6 with PostgreSQL
- **Cache/Queue**: Redis 7 + BullMQ
- **Auth**: JWT (jsonwebtoken) + bcrypt + Redis session store
- **Testing**: Jest + Supertest
- **Validation**: Zod
- **Logging**: Winston with daily rotation (`config/logger.ts`)
- **Metrics**: Prometheus (prom-client)

### Layered Architecture

```
HTTP Request
    ↓
Middleware (cors, json, metrics, requestId, logger, rateLimiter) [app.ts]
    ↓
Routes (express.Router) [{name}.routes.ts]
    ↓
Controller (HTTP handling, no try/catch) [{name}.controller.ts]
    ↓
Service (Business logic, throws AppError) [{name}.service.ts]
    ↓
Repository (Sequelize queries) [{name}.repository.ts]
    ↓
Model (Sequelize model + toJSON strip) [{name}.model.ts]
    ↓
PostgreSQL
```

## Project Structure

```
backend/
├── src/
│   ├── modules/                # Domain modules
│   │   ├── auth/               # Login, register, refresh, verify email, password reset
│   │   │   ├── auth.controller.ts   # Class: AuthController
│   │   │   ├── auth.service.ts      # Class: AuthService
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.validation.ts   # Zod schemas
│   │   │   ├── auth.types.ts        # RegisterDTO, LoginDTO
│   │   │   └── auth.redis.ts        # Refresh token helpers (setRefreshToken etc.)
│   │   ├── user/               # User management
│   │   │   ├── user.controller.ts   # Class: UserController
│   │   │   ├── user.service.ts      # Class: UserService
│   │   │   ├── user.repository.ts   # Class: UserRepository
│   │   │   ├── user.model.ts        # Sequelize User model
│   │   │   ├── user.routes.ts
│   │   │   ├── user.validation.ts
│   │   │   └── user.types.ts        # UserRole, UserEntity, UserResponseDto, CreateUserDto
│   │   ├── product/            # Product CRUD
│   │   │   ├── product.controller.ts  # Class: ProductController
│   │   │   ├── product.service.ts     # Class: ProductService
│   │   │   ├── product.repository.ts  # Class: ProductRepository
│   │   │   ├── product.model.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── product.validation.ts
│   │   │   └── product.types.ts       # ProductEntity, ProductResponseDto, CreateProductDto, UpdateProductDto
│   │   ├── health/             # Health check endpoint (GET /health)
│   │   ├── metrics/            # Prometheus metrics service
│   │   └── monitoring/         # Monitoring service
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts      # authenticate (sets req.user), AuthRequest interface
│   │   ├── role.middleware.ts      # authorize(roles[]) — import from HERE, not auth.middleware
│   │   ├── rateLimit.middleware.ts # globalRateLimiter, authRateLimiter
│   │   ├── validate.middleware.ts  # validate(schema) for body, validateQuery(schema) for query
│   │   ├── error.middleware.ts     # errorHandler — global error handler
│   │   ├── logger.middleware.ts    # requestLogger
│   │   ├── metrics.middleware.ts   # metricsMiddleware
│   │   └── requestId.middleware.ts # requestIdMiddleware, RequestWithId interface
│   │
│   ├── services/               # Shared services (NOT domain services)
│   │   ├── redis.service.ts    # redisService (get/set/delete/getKeys/deleteAll)
│   │   └── email.service.ts    # email sending abstraction
│   │
│   ├── utils/
│   │   ├── appError.ts         # AppError class (named export: import { AppError })
│   │   ├── jwt.ts              # signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken
│   │   ├── hash.ts             # hashPassword, comparePassword
│   │   ├── token.ts            # generateToken, hashToken (for email verification/reset)
│   │   └── time.ts             # days(n) helper for TTL
│   │
│   ├── config/
│   │   ├── env.ts              # env object (DATABASE_URL, REDIS_URL, JWT_ACCESS_SECRET, etc.)
│   │   ├── db.ts               # sequelize instance, connectDB()
│   │   ├── redis.ts            # redis client
│   │   ├── logger.ts           # Winston logger instance
│   │   └── cookie.config.ts    # Cookie options
│   │
│   ├── jobs/
│   │   ├── producers/          # addEmailJob()
│   │   ├── queues/             # BullMQ queue definitions
│   │   └── workers/            # email.worker.ts
│   │
│   ├── app.ts                  # Express app + middleware + routes wired
│   ├── server.ts               # HTTP server + graceful shutdown
│   └── worker.ts               # Worker entry point
│
├── tests/
│   ├── unit/
│   │   ├── modules/
│   │   │   ├── auth/           # AuthService, AuthController, auth.redis tests
│   │   │   ├── user/           # UserService, UserController, UserRepository tests
│   │   │   ├── product/        # ProductService, ProductController, ProductRepository tests
│   │   │   ├── health/
│   │   │   ├── metrics/
│   │   │   └── monitoring/
│   │   ├── middlewares/        # Middleware unit tests
│   │   └── utils/              # Utility unit tests
│   ├── integration/            # API-level tests using Supertest
│   │   ├── auth.validation.test.ts
│   │   ├── product.validation.test.ts
│   │   ├── user.validation.test.ts
│   │   ├── middleware.test.ts
│   │   └── health.test.ts
│   └── setup.ts
│
├── migrations/                 # Sequelize CLI migrations
└── logs/                       # Winston log files
```

## Coding Standards

### TypeScript
- Strict mode enabled
- Explicit return types on public methods
- `interface` for object shapes, `type` for unions/aliases
- Never use `any` — use `unknown` with type guards
- Path alias `@/` maps to `src/` in dev, `dist/` in production

### Class-Based Module Pattern

All controllers, services, and repositories are **classes**, not plain objects.

```
modules/{name}/
├── {name}.routes.ts       # Instantiates controller: const controller = new FooController()
├── {name}.controller.ts   # export class FooController { ... }
├── {name}.service.ts      # export class FooService { ... }
├── {name}.repository.ts   # export class FooRepository { ... }
├── {name}.model.ts        # Sequelize model class
├── {name}.types.ts        # DTOs and interfaces
└── {name}.validation.ts   # Zod schemas
```

### AppError — Named Import

```typescript
// ✅ Correct
import { AppError } from "@/utils/appError";

throw AppError.notFound("Product not found");
throw AppError.conflict(`SKU "${sku}" already exists`);
throw AppError.unauthorized("Invalid credentials");
throw AppError.forbidden("Admin access required");
throw AppError.badRequest("Invalid input");

// ❌ Wrong — not a default export
import AppError from "@/utils/appError";
```

**AppError static methods:**
- `AppError.badRequest(message)` — 400
- `AppError.unauthorized(message)` — 401
- `AppError.forbidden(message)` — 403
- `AppError.notFound(message)` — 404
- `AppError.conflict(message)` — 409
- `AppError.internal(message)` — 500

### Controller Pattern (Express 5 — NO try/catch)

```typescript
import { Request, Response } from "express";
import { ProductService } from "./product.service";

const service = new ProductService();

export class ProductController {
  async getAll(req: Request, res: Response) {
    const products = await service.getAll();
    res.json(products);
  }

  async getById(req: Request, res: Response) {
    const product = await service.getById(Number(req.params.id));
    res.json(product);
  }

  async create(req: Request, res: Response) {
    const product = await service.create(req.body);
    res.status(201).json(product);
  }

  async update(req: Request, res: Response) {
    const product = await service.update(Number(req.params.id), req.body);
    res.json(product);
  }

  async delete(req: Request, res: Response) {
    await service.delete(Number(req.params.id));
    res.status(204).send();
  }
}
```

> ⚠️ **NO try/catch in controllers.** Express 5 automatically catches async errors and routes them to `errorHandler`.

### Service Pattern

```typescript
import { AppError } from "@/utils/appError";
import { ProductRepository } from "./product.repository";
import { CreateProductDto, ProductResponseDto } from "./product.types";

export class ProductService {
  private repo = new ProductRepository();

  async create(data: CreateProductDto): Promise<ProductResponseDto> {
    const existing = await this.repo.findBySku(data.sku);
    if (existing) {
      throw AppError.conflict(`Product with SKU "${data.sku}" already exists`);
    }
    const product = await this.repo.create(data);
    return this.toResponse(product);
  }

  async getById(id: number): Promise<ProductResponseDto> {
    const product = await this.repo.findById(id);
    if (!product) {
      throw AppError.notFound(`Product with id ${id} not found`);
    }
    return this.toResponse(product);
  }
}
```

### Repository Pattern

```typescript
import { Product } from "./product.model";
import { CreateProductDto } from "./product.types";

export class ProductRepository {
  async findAll() {
    return Product.findAll({ order: [["createdAt", "DESC"]] });
  }

  async findById(id: number) {
    return Product.findByPk(id);
  }

  async findBySku(sku: string) {
    return Product.findOne({ where: { sku } });
  }

  async create(data: CreateProductDto) {
    return Product.create(data);
  }

  async update(id: number, data: Partial<CreateProductDto>) {
    const [affected, rows] = await Product.update(data, {
      where: { id },
      returning: true,
    });
    return affected > 0 ? rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const count = await Product.destroy({ where: { id } });
    return count > 0;
  }
}
```

### Route Pattern

```typescript
import { Router } from "express";
import { ProductController } from "./product.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";        // ← from role.middleware, NOT auth.middleware
import { validate } from "@/middlewares/validate.middleware";
import { createProductSchema, updateProductSchema } from "./product.validation";

const router = Router();
const controller = new ProductController();

// Public
router.get("/", controller.getAll.bind(controller));
router.get("/:id", controller.getById.bind(controller));

// Admin only
router.post("/", authenticate, authorize(["admin"]), validate(createProductSchema), controller.create.bind(controller));
router.put("/:id", authenticate, authorize(["admin"]), validate(updateProductSchema), controller.update.bind(controller));
router.delete("/:id", authenticate, authorize(["admin"]), controller.delete.bind(controller));

export default router;
```

> ⚠️ Always call `.bind(controller)` when passing class methods as route handlers.

### Validation Middleware

Two variants exist in `validate.middleware.ts`:

```typescript
import { validate, validateQuery } from "@/middlewares/validate.middleware";

// Validates req.body
router.post("/login", validate(loginSchema), controller.login.bind(controller));

// Validates req.query (e.g. GET /auth/verify-email?token=...)
router.get("/verify-email", validateQuery(verifyEmailSchema), controller.verifyEmail.bind(controller));
```

### Logging

**Never use `console.log`** — use Winston logger:

```typescript
import { logger } from "@/config/logger";

logger.info("User registered", { userId: user.id, email: user.email });
logger.warn("Failed login attempt", { email, requestId });
logger.error("Unexpected error", { error: err.message });
```

### Types and DTOs

Each module has a `{name}.types.ts` with:
- `{Name}Entity` — internal representation matching the DB model
- `{Name}ResponseDto` — safe shape returned to clients (no passwords)
- `Create{Name}Dto` / `Update{Name}Dto` — input shapes from validated requests

Services map `Entity → ResponseDto` via a private `toResponse()` method.

```typescript
private toResponse(product: ProductEntity): ProductResponseDto {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    // ...never include sensitive fields
  };
}
```

### Sequelize Model Pattern

```typescript
import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "@/config/db";

interface Attributes {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  isVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CreationAttributes extends Optional<Attributes, "id"> {}

export class User extends Model<Attributes, CreationAttributes> implements Attributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public role!: "user" | "admin";
  public isVerified!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({ /* fields */ }, { sequelize, tableName: "users", timestamps: true });

// Strip sensitive fields from JSON responses
User.prototype.toJSON = function () {
  const { password, ...rest } = this.get();
  return rest;
};
```

## Auth System

### Flow
1. `register` → hash password → create user → send verification email → return JWT pair
2. `login` → verify email is verified → verify password → create sessionId → store refresh token in Redis → return JWT pair
3. `refresh` → verify refresh token → check Redis (token rotation) → return new JWT pair
4. `logout` → delete refresh token from Redis by userId + sessionId
5. `verify-email` → find user by hashed token → set `isVerified = true`
6. `forgot-password` → generate reset token → save hash to DB with 15min expiry → send email
7. `reset-password` → find user by valid hashed token → hash new password → clear token fields

### Redis Token Storage

Refresh tokens stored as: `refresh_token:{userId}:{sessionId}` → token value

```typescript
import { setRefreshToken, getRefreshToken, deleteRefreshToken, logoutAll } from "./auth.redis";

await setRefreshToken(userId, sessionId, refreshToken);   // TTL: 7 days
await getRefreshToken(userId, sessionId);
await deleteRefreshToken(userId, sessionId);
await logoutAll(userId);  // Deletes all sessions for a user
```

### JWT Payload

```typescript
{
  id: number;
  email: string;
  role: "user" | "admin";
  sessionId: string;   // ← UUID per session, enables per-device logout
}
```

### Auth Middleware

```typescript
import { authenticate } from "@/middlewares/auth.middleware";
import { authorize } from "@/middlewares/role.middleware";

// authenticate → sets req.user = { id, email, role, sessionId }
// authorize    → checks req.user.role is in allowed roles

router.post("/products", authenticate, authorize(["admin"]), controller.create.bind(controller));
```

## Environment Variables

Actual variable names from `src/config/env.ts`:

```bash
# Server
NODE_ENV=development
PORT=4000

# Database (single connection string)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecommerce

# Redis
REDIS_URL=redis://localhost:6379

# JWT (exact names — do NOT use JWT_SECRET or JWT_EXPIRES_IN)
JWT_ACCESS_SECRET=your-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
ACCESS_TOKEN_EXPIRES=15m       # not JWT_EXPIRES_IN
REFRESH_TOKEN_EXPIRES=7d       # not JWT_REFRESH_EXPIRES_IN

# App URLs (used in email templates)
API_URL=https://api.infra-pro.com
FE_URL=https://app.infra-pro.com
```

## Background Jobs (BullMQ)

Email jobs go through a producer → queue → worker pipeline:

```typescript
// Enqueue from anywhere in the app
import { addEmailJob } from "@/jobs/producers/email.producer";

await addEmailJob({
  to: user.email,
  subject: "Verify your account",
  html: `Click here: ${verifyUrl}`,
});
```

Start worker:
```bash
npm run worker            # Development (tsx watch)
npm run worker:production # Production (compiled)
```

## Testing

### Test Structure (actual layout)

```
tests/
├── unit/
│   ├── modules/
│   │   ├── auth/           # AuthService, AuthController, auth.redis
│   │   ├── user/           # UserService, UserController, UserRepository
│   │   ├── product/        # ProductService, ProductController, ProductRepository
│   │   ├── health/
│   │   ├── metrics/
│   │   └── monitoring/
│   ├── middlewares/        # validate, auth, role, error middleware tests
│   └── utils/              # appError, jwt, hash, token, time tests
└── integration/            # Supertest tests against actual Express app
    ├── auth.validation.test.ts
    ├── product.validation.test.ts
    ├── user.validation.test.ts
    ├── middleware.test.ts
    └── health.test.ts
```

### Unit Test Pattern (class-based mocking)

```typescript
import { ProductService } from "@/modules/product/product.service";
import { ProductRepository } from "@/modules/product/product.repository";

jest.mock("@/modules/product/product.repository");

describe("ProductService", () => {
  let service: ProductService;
  let mockRepo: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockRepo = new ProductRepository() as jest.Mocked<ProductRepository>;
    (ProductRepository as jest.Mock).mockImplementation(() => mockRepo);
    service = new ProductService();
  });

  it("throws conflict when SKU exists", async () => {
    mockRepo.findBySku.mockResolvedValue({ id: 1, sku: "TEST-001" } as any);

    await expect(service.create({ sku: "TEST-001", name: "A", price: 10, stock: 5, createdBy: 1 }))
      .rejects.toThrow("already exists");
  });
});
```

### Integration Test Pattern

```typescript
import request from "supertest";
import app from "@/app";

describe("POST /api/v1/auth/login", () => {
  it("returns 400 for invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "Test1234!" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation error");
  });
});
```

### Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm run test:coverage` | Coverage report |
| `npm test -- --watch` | Watch mode |
| `npm test -- tests/unit/modules/product` | Run specific folder |

**Coverage Targets:** Global 80%, Services 90%

## API Reference

### Auth Routes (`/api/v1/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | — | Register (rate limited) |
| POST | `/login` | — | Login (rate limited) |
| POST | `/refresh` | — | Rotate JWT pair |
| POST | `/logout` | ✅ Bearer | Delete session |
| GET | `/verify-email?token=` | — | Verify email |
| POST | `/forgot-password` | — | Send reset email |
| POST | `/reset-password` | — | Set new password |

### User Routes (`/api/v1/users`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ admin | List all users |

### Product Routes (`/api/v1/products`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List all products (paginated) |
| GET | `/:id` | — | Get product |
| POST | `/` | ✅ admin | Create product |
| PUT | `/:id` | ✅ admin | Update product |
| DELETE | `/:id` | ✅ admin | Delete product |

### Category Routes (`/api/v1/categories`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | List all categories (paginated) |
| GET | `/:id` | — | Get category by ID |
| GET | `/slug/:slug` | — | Get category by slug |
| POST | `/` | ✅ admin | Create category |
| PUT | `/:id` | ✅ admin | Update category |
| DELETE | `/:id` | ✅ admin | Delete category |

### Order Routes (`/api/v1/orders`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | ✅ admin | List all orders (paginated) |
| GET | `/:id` | ✅ | Get order by ID |
| GET | `/user/:userId` | ✅ | Get orders by user ID |
| POST | `/` | ✅ | Create new order |
| PUT | `/:id` | ✅ admin | Update order status |
| DELETE | `/:id` | ✅ admin | Delete order |

### Other

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| GET | `/metrics` | — | Prometheus metrics |

## User Model Fields

```typescript
{
  id: number;
  email: string;
  password: string;   // ← stripped in toJSON()
  name?: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationToken?: string | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## Product Model Fields

```typescript
{
  id: number;
  name: string;
  description: string | null;
  price: number;       // DECIMAL
  stock: number;       // INTEGER
  sku: string;         // unique
  isActive: boolean;
  createdBy: number;   // FK → users.id
  categoryId: number | null;  // FK → categories.id
  createdAt: Date;
  updatedAt: Date;
}
```

## Category Model Fields

```typescript
{
  id: number;
  name: string;
  slug: string;        // unique, lowercase alphanumeric with hyphens
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Order Model Fields

```typescript
{
  id: number;
  userId: number;           // FK → users.id
  status: OrderStatus;      // pending | processing | shipped | delivered | cancelled
  paymentStatus: PaymentStatus; // pending | paid | failed | refunded
  totalAmount: number;       // DECIMAL(10,2)
  shippingAddress: string;  // Text
  billingAddress: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

## OrderItem Model Fields

```typescript
{
  id: number;
  orderId: number;          // FK → orders.id
  productId: number;      // FK → products.id
  quantity: number;        // INTEGER, min: 1
  unitPrice: number;        // DECIMAL(10,2) - price at time of order
  createdAt: Date;
  updatedAt: Date;
}
```

## Docker Context

| Container | Name | Port |
|-----------|------|------|
| Backend API | `ecommerce_backend` | 4000 |
| Worker | `ecommerce_worker` | — |
| PostgreSQL | `ecommerce_postgres` | 5432 |
| Redis | `ecommerce_redis` | 6379 |
| Prometheus | `ecommerce_prometheus` | 9090 |
| Grafana | `ecommerce_grafana` | 3001 |
| Nginx | `ecommerce_nginx` | 80/443 |

## Known TODOs / Planned Work

- [x] Sequelize CLI migrations for production schema management
- [x] Product categories / tags
- [x] Order management module
- [ ] Rate limiting per-user (currently global + auth-specific)
- [ ] Helmet middleware for security headers
- [ ] Expand integration test coverage

## Pre-Commit Checklist

- [ ] No `console.log` — use `logger` from `@/config/logger`
- [ ] No `any` types
- [ ] Controllers have no try/catch (Express 5 handles it)
- [ ] Services throw `AppError` (named import), not `new Error()`
- [ ] Route handlers use `.bind(controller)`
- [ ] Zod validation schema added for new routes
- [ ] `authorize` imported from `role.middleware`, not `auth.middleware`
- [ ] Tests added for new functionality
- [ ] New env vars added to `config/env.ts`
- [ ] DB schema changes have a migration

<!-- END:project-rules -->
