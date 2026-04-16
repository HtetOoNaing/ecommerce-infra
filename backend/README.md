# Backend API

Express.js REST API with TypeScript, featuring layered architecture, JWT authentication, and comprehensive testing.

## Architecture

```
Request → Route → Controller → Service → Repository → Model → Database
                ↓
         Middleware (Auth, Validation, Rate Limiting)
```

## Tech Stack

- **Framework**: Express 5
- **Language**: TypeScript 5
- **ORM**: Sequelize 6
- **Database**: PostgreSQL 15
- **Cache/Queue**: Redis 7 + BullMQ
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Testing**: Jest + Supertest

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication module
│   │   ├── auth.routes.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.validation.ts
│   ├── user/           # User management
│   │   ├── user.model.ts
│   │   ├── user.repository.ts
│   │   ├── user.service.ts
│   │   └── user.controller.ts
│   └── product/        # Product CRUD
│       ├── product.model.ts
│       ├── product.repository.ts
│       ├── product.service.ts
│       └── product.controller.ts
├── config/
│   ├── db.ts           # Database connection
│   ├── redis.ts        # Redis client
│   └── env.ts          # Environment variables
├── middlewares/
│   ├── auth.middleware.ts      # JWT verification
│   ├── cors.middleware.ts      # CORS config
│   ├── rateLimit.middleware.ts # Rate limiting
│   ├── validate.middleware.ts  # Zod validation
│   └── error.middleware.ts     # Error handling
├── utils/
│   ├── appError.ts     # Custom error class
│   └── logger.ts       # Logging utility
├── jobs/
│   └── workers/
│       └── email.worker.ts  # Background job processor
└── app.ts              # Express app setup
```

## Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations (Sequelize syncs automatically)
npm run dev
```

### Docker Development
```bash
# Start with docker-compose from project root
cd ..
docker compose up -d postgres redis backend
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript to dist/ |
| `npm start` | Run production build |
| `npm run worker` | Start email worker (dev) |
| `npm run worker:production` | Start email worker (prod) |
| `npm test` | Run Jest tests |
| `npm run test:coverage` | Run tests with coverage |

## API Reference

### Authentication

#### POST /api/v1/auth/register
Create a new user account.
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

#### POST /api/v1/auth/login
Authenticate and get tokens.
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```
Response:
```json
{
  "user": { "id": 1, "email": "user@example.com", "role": "user" },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/v1/auth/refresh
Get new access token using refresh token.
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### POST /api/v1/auth/logout
Invalidate tokens.

### Users

#### GET /api/v1/users
List all users (admin only).

**Headers:** `Authorization: Bearer <accessToken>`

### Products

#### GET /api/v1/products
List all products (public).

#### GET /api/v1/products/:id
Get single product (public).

#### POST /api/v1/products
Create product (admin only).
```json
{
  "name": "MacBook Pro",
  "description": "16 inch laptop",
  "price": 2499.99,
  "stock": 50,
  "sku": "MBP-16-2026"
}
```

#### PUT /api/v1/products/:id
Update product (admin only).

#### DELETE /api/v1/products/:id
Delete product (admin only).

## Testing

### Run Tests
```bash
# All tests
npm test

# With coverage
npm run test:coverage

# Watch mode
npm run test -- --watch
```

### Test Structure
```
tests/
├── unit/
│   ├── services/       # Service layer tests
│   ├── repositories/   # Repository tests
│   └── utils/          # Utility tests
├── integration/
│   └── routes/         # API endpoint tests
└── setup.ts            # Test configuration
```

### Test Database
Tests use an in-memory SQLite database or a separate test PostgreSQL database (configured via `TEST_DB_NAME` env var).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | API server port | `4000` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `ecommerce` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_REFRESH_SECRET` | Refresh token secret | Required |
| `JWT_EXPIRES_IN` | Access token expiry | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `7d` |

## Key Patterns

### Layered Architecture
```typescript
// routes → controller → service → repository → model
// Each layer has single responsibility
```

### Error Handling
```typescript
// Use AppError for operational errors
throw AppError.notFound("Product not found");
throw AppError.unauthorized("Invalid credentials");
throw AppError.conflict("Email already exists");
```

### Authentication Middleware
```typescript
// Protect routes
router.post("/products", authenticate, authorize(["admin"]), controller.create);
```

## Background Jobs

Email processing is handled by BullMQ workers:

```bash
# Start worker
npm run worker
```

Jobs are queued in Redis and processed asynchronously.

## Database Migrations

Sequelize syncs models automatically in development. For production:

```bash
# Coming soon: Sequelize CLI migrations
npx sequelize-cli db:migrate
```

## Troubleshooting

### Database connection fails
- Check PostgreSQL is running: `docker compose ps postgres`
- Verify env vars in `.env`
- Check logs: `docker compose logs postgres`

### Redis connection fails
- Verify Redis is running: `docker compose ps redis`
- Check `REDIS_URL` format: `redis://host:port`

### JWT errors
- Ensure `JWT_SECRET` and `JWT_REFRESH_SECRET` are set
- Secrets must be at least 32 characters for security

## License

MIT
