# InfraPro — E-Commerce Infrastructure Platform

A production-ready, full-stack e-commerce monorepo with a customer storefront, admin dashboard, and Express API — orchestrated with Turborepo and pnpm workspaces.

## Architecture

```
https://infra-pro.com        https://app.infra-pro.com     https://api.infra-pro.com
  (Customer Storefront)         (Admin Dashboard)               (Backend API)
      Next.js 16                   Next.js 16                   Express 5 + TS
          │                             │                              │
          └─────────────────────────────┴──────────────────────────────┘
                                        │
                           ┌────────────▼────────────┐
                           │          Nginx          │
                           │  (SSL, Routing, CORS)   │
                           └────────────┬────────────┘
                                        │
             ┌──────────────────────────┼──────────────────────────┐
             │                          │                          │
   ┌─────────▼──────────┐   ┌───────────▼──────────┐  ┌───────────▼────────┐
   │    storefront       │   │       backend         │  │       worker       │
   │    (port 3001)      │   │     (port 4000)       │  │      (BullMQ)      │
   └────────────────────┘   └───────────┬──────────┘  └────────────────────┘
                                         │
                        ┌────────────────┼────────────┐
                        │                │            │
                  ┌─────▼─────┐    ┌─────▼────┐  ┌───▼──────┐
                  │PostgreSQL │    │  Redis   │  │Prometheus│
                  │    15     │    │    7     │  │+ Grafana │
                  └───────────┘    └──────────┘  └──────────┘
```

## Monorepo Structure

```
ecommerce-infra/
├── apps/
│   ├── admin/               # Next.js 16 admin dashboard (port 3000)
│   ├── storefront/          # Next.js 16 customer storefront (port 3001)
│   └── backend/             # Express 5 API (port 4000)
├── packages/
│   ├── shared-types/        # TypeScript interfaces (zero runtime deps)
│   ├── ui/                  # Shared React components
│   └── api-client/          # Shared Axios factory + ApiError + token helpers
├── nginx/                   # nginx.conf + SSL certs
├── monitoring/              # Prometheus + Grafana config
├── docker-compose.yml
├── turbo.json               # Turborepo pipeline
├── pnpm-workspace.yaml      # pnpm workspace config
└── package.json             # Root scripts (turbo dev/build/test)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Storefront | Next.js 16, React 19, Tailwind CSS 4 |
| Admin | Next.js 16, React 19, Tailwind CSS 4, Recharts |
| Backend | Express 5, TypeScript 5, Sequelize 6, PostgreSQL 15 |
| Cache / Queue | Redis 7 + BullMQ |
| Auth | JWT (access + refresh) + bcrypt — separate secrets for admin vs customers |
| Testing | Backend: Jest + Supertest · Frontend: Vitest + RTL + MSW · E2E: Playwright |
| Proxy | Nginx 1.25 (SSL, CORS, rate limiting, gzip) |
| Monitoring | Prometheus + Grafana |
| Containers | Docker + Docker Compose |

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Node.js 20+](https://nodejs.org/)
- [pnpm](https://pnpm.io/installation): `npm install -g pnpm`
- [mkcert](https://github.com/FiloSottile/mkcert) (local SSL)

### 1. Clone & Install

```bash
git clone https://github.com/HtetOoNaing/ecommerce-infra.git
cd ecommerce-infra

# Install all workspace dependencies (always run from repo root)
pnpm install
```

> ⚠️ **Never run `npm install` inside a sub-app.** The `workspace:*` protocol requires pnpm run from the root.

### 2. Set Up SSL & Hosts

```bash
# Generate local SSL certificates
./nginx/generate-ssl.sh

# Add local domains
echo "127.0.0.1 infra-pro.com app.infra-pro.com api.infra-pro.com" | sudo tee -a /etc/hosts
```

### 3. Configure Environment

```bash
cp apps/backend/.env.example apps/backend/.env
# Edit .env with your values (see Environment Variables section)
```

### 4. Start All Services (Docker)

```bash
docker compose up -d
```

| URL | Service |
|-----|---------|
| https://infra-pro.com | Customer storefront |
| https://app.infra-pro.com | Admin dashboard |
| https://api.infra-pro.com | Backend API |
| http://localhost:9090 | Prometheus |
| http://localhost:3030 | Grafana (Docker only) |

**Default admin credentials:** `admin@test.com` / `Test1234!`

## Local Development

All apps run in parallel via Turborepo:

```bash
# Run all apps simultaneously
pnpm dev

# Run a single app
pnpm --filter @infrapro/storefront dev    # http://localhost:3001
pnpm --filter @infrapro/admin dev         # http://localhost:3000
pnpm --filter @infrapro/backend dev       # http://localhost:4000
```

### Running Tests

```bash
# All workspaces
pnpm test

# Single workspace
pnpm --filter @infrapro/backend test
pnpm --filter @infrapro/admin test
pnpm --filter @infrapro/storefront test
```

### Type Checking

```bash
pnpm typecheck
```

## Auth Architecture

Two completely separate auth systems — never mix them:

| Aspect | Customer (Storefront) | Admin (Dashboard) |
|--------|----------------------|-------------------|
| DB table | `customers` | `users` |
| JWT secrets | `CUSTOMER_JWT_ACCESS_SECRET` / `CUSTOMER_JWT_REFRESH_SECRET` | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` |
| localStorage keys | `customerAccessToken`, `customerRefreshToken` | `accessToken`, `refreshToken` |
| API prefix | `/api/v1/customer/auth/*` | `/api/v1/auth/*` |
| Backend middleware | `customerAuthenticate` | `authenticate` |

## API Reference

### Admin Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Create admin account |
| POST | `/login` | — | Login, receive tokens |
| POST | `/logout` | ✓ | Invalidate session |
| POST | `/refresh` | — | Rotate access token |
| POST | `/forgot-password` | — | Request reset email |
| POST | `/reset-password` | — | Set new password |

### Customer Auth — `/api/v1/customer/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | — | Create customer account |
| POST | `/login` | — | Login, receive tokens |
| POST | `/logout` | ✓ | Invalidate session |
| POST | `/refresh` | — | Rotate access token |
| POST | `/forgot-password` | — | Request reset email |
| POST | `/reset-password` | — | Set new password |

### Products — `/api/v1/products`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List products (paginated, filterable) |
| GET | `/:id` | — | Get single product |
| POST | `/` | Admin | Create product |
| PUT | `/:id` | Admin | Update product |
| DELETE | `/:id` | Admin | Delete product |

### Categories — `/api/v1/categories`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | — | List categories |
| GET | `/:id` | — | Get category |
| POST | `/` | Admin | Create category |
| PUT | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | Delete category |

### Orders — `/api/v1/orders`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Customer | Create order |
| GET | `/customer/orders` | Customer | List own orders |
| GET | `/customer/orders/:id` | Customer | Get own order |
| GET | `/` | Admin | List all orders |
| PUT | `/:id/status` | Admin | Update order status |

## Shared Packages

### `@infrapro/shared-types`

TypeScript interfaces only — zero runtime dependencies. Shared across all apps.

```typescript
import type { Product, Customer, Order, PaginatedResponse } from "@infrapro/shared-types";
```

### `@infrapro/api-client`

Exports a `createApiClient(config)` factory returning a configured Axios instance with request/response interceptors, 401 refresh token queue, and `axios-retry` on 5xx/network errors only.

```typescript
import { createApiClient, ApiError } from "@infrapro/api-client";
```

### `@infrapro/ui`

Shared React components (Button, Input, Badge, etc.) usable in both admin and storefront.

```typescript
import { Button, Badge } from "@infrapro/ui";
```

## Environment Variables

### `apps/backend/.env`

```env
NODE_ENV=development
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=ecommerce

REDIS_URL=redis://localhost:6379

# Admin JWT
JWT_ACCESS_SECRET=your-admin-access-secret
JWT_REFRESH_SECRET=your-admin-refresh-secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Customer JWT (separate secrets — never reuse admin secrets)
CUSTOMER_JWT_ACCESS_SECRET=your-customer-access-secret
CUSTOMER_JWT_REFRESH_SECRET=your-customer-refresh-secret
CUSTOMER_ACCESS_TOKEN_EXPIRES=15m
CUSTOMER_REFRESH_TOKEN_EXPIRES=7d

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASS=your-password
```

### `apps/admin/.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
```

### `apps/storefront/.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
NEXT_PUBLIC_SITE_URL=https://infra-pro.com
```

## Monitoring

- **Prometheus**: scrapes `/metrics` on the backend every 15s
- **Grafana**: pre-configured dashboards — `http://localhost:3030` (Docker)
- **Metrics collected**: HTTP request rate, response times, error rates

## Troubleshooting

### `npm install` fails with `workspace:*` error

Use `pnpm install` from the **repo root** — not `npm install` inside a sub-app.

### Containers won't start

```bash
docker compose down -v
docker compose up -d --build
```

### Database connection errors

```bash
docker compose logs postgres
# Verify .env DB_* vars match docker-compose.yml defaults
```

### CORS errors

- Check `nginx/nginx.conf` for the correct `$cors_origin` mapping
- Confirm `NEXT_PUBLIC_API_URL` in `.env.local` has no trailing slash

### Grafana credentials

Default login at `http://localhost:3030`: `admin` / `admin`

## License

MIT
