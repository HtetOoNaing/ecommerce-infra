# InfraPro — Project Roadmap

## Current State

```
ecommerce-infra/
├── backend/        Express 5 + TypeScript + Sequelize + PostgreSQL
├── frontend/       Next.js 16 (Admin Dashboard only)
├── nginx/          SSL termination, routing, rate limiting
├── monitoring/     Prometheus + Grafana
└── docker-compose.yml
```

**Domains:**
- `infra-pro.com` → Static landing page (nginx)
- `app.infra-pro.com` → Admin dashboard (`frontend:3000`)
- `api.infra-pro.com` → Express API (`backend:4000`)

**Backend modules complete:** Auth, User, Product, Category, Order

---

## Target Architecture

```
ecommerce-infra/
├── apps/
│   ├── admin/          Renamed from frontend/ — Admin Dashboard
│   ├── storefront/     NEW — Customer-facing storefront
│   └── backend/        Renamed from backend/
├── packages/
│   ├── shared-types/   TypeScript interfaces shared across apps
│   ├── ui/             Shared React components (Button, Badge, Input...)
│   └── api-client/     Shared request(), ApiError, token helpers
├── nginx/
├── monitoring/
├── docker-compose.yml
├── turbo.json          Turborepo pipeline
└── pnpm-workspace.yaml
```

**New Domains:**
- `infra-pro.com` → Storefront (`storefront:3001`)
- `app.infra-pro.com` → Admin (`admin:3000`) — IP-restricted in nginx
- `api.infra-pro.com` → Backend (`backend:4000`)

---

## Phase Roadmap

### Phase 1 — Monorepo Restructure [DONE]
> Goal: reorganize into `apps/` + `packages/` without breaking anything

- [x] Set up `pnpm-workspace.yaml`
- [x] Set up `turbo.json` with build/test/lint pipelines
- [x] Move `frontend/` → `apps/admin/`
- [x] Move `backend/` → `apps/backend/`
- [x] Create `packages/shared-types/` — extract types from both apps
- [x] Create `packages/ui/` — extract Button, Badge, Input, etc.
- [x] Create `packages/api-client/` — axios-based client replacing current fetch-based `client.ts`
  - [x] `createApiClient(config)` factory — returns configured axios instance
  - [x] Request interceptor: inject `Authorization: Bearer <token>` header
  - [x] Response interceptor: 401 refresh token queue, `AxiosError` → `ApiError` transform
  - [x] `axios-retry`: retries on 5xx + `ECONNABORTED`, exponential backoff, never retries 4xx
  - [x] `ApiError` class: `status`, `message`, `errors[]`
  - [x] Token helpers: `getAccessToken`, `setAccessToken`, `getRefreshToken`, `setRefreshToken`, `clearAuth`
  - [x] Separate instances for admin and customer (Phase 2+)
- [x] Migrate `frontend/lib/api/client.ts` to use `packages/api-client` axios instance
- [x] Update all import paths in admin and backend
- [x] Update `docker-compose.yml` build contexts
- [x] Verify all tests pass

### Phase 2 — Separate Customer Auth [IN PROGRESS]
> Goal: customers and admins use separate DB tables and JWT secrets

**Backend:**
- [x] Create `customers` table migration (email, password_hash, name, phone, email_verified, shipping_addresses jsonb)
- [x] Create `Customer` Sequelize model
- [x] Create `customer-auth` module (`/api/v1/customer/auth/*`)
  - [x] `POST /customer/auth/register` — creates customer, NOT admin user
  - [x] `POST /customer/auth/login` — issues customer JWT (separate secret)
  - [x] `POST /customer/auth/refresh`
  - [x] `POST /customer/auth/forgot-password`
  - [x] `POST /customer/auth/reset-password`
- [x] Add `CUSTOMER_JWT_ACCESS_SECRET` and `CUSTOMER_JWT_REFRESH_SECRET` env vars
- [x] Create `customerAuthenticate` middleware (validates customer JWT only)
- [x] Create `customer-profile` module (`/api/v1/customer/profile`)
  - [x] `GET /customer/profile`
  - [x] `PUT /customer/profile`
  - [x] `GET /customer/addresses`
  - [x] `POST /customer/addresses`
- [ ] Update `Order` to reference `customers.id` (or keep `userId` flexible — see note)
- [ ] Add unit + integration tests for all new modules
- [ ] Update `backend/AGENTS.md`

> **Note on Orders:** Keep `orders.userId` pointing to `customers.id` for storefront orders. Admin-created orders can reference `admin_users.id` with a `createdByAdminId` field.

### Phase 3 — Storefront App
> Goal: customer-facing Next.js app with full shopping journey

**Scaffold:**
- [ ] Create `apps/storefront/` (Next.js 16, TypeScript, Tailwind CSS 4)
- [ ] Set up `@infrapro/shared-types`, `@infrapro/ui`, `@infrapro/api-client` imports
- [ ] Create `storefront/AGENTS.md`
- [ ] Add `storefront` service to `docker-compose.yml`
- [ ] Update `nginx.conf` — route `infra-pro.com` → storefront, IP-restrict admin

**Pages:**
- [ ] Homepage (`/`) — hero banner, featured products, categories
- [ ] Product listing (`/products`) — grid, search, filter by category, pagination
- [ ] Product detail (`/products/[id]`) — images, description, add to cart (ISR)
- [ ] Cart (`/cart`) — line items, quantity update, remove, subtotal
- [ ] Checkout (`/checkout`) — shipping address form, order summary
- [ ] Order confirmation (`/orders/[id]`) — post-checkout success page
- [ ] Order history (`/account/orders`) — customer's past orders
- [ ] Customer auth pages — login, register, forgot-password

**State:**
- [ ] `CartContext` — localStorage-persisted cart, merge on login
- [ ] `CustomerAuthContext` — customer-specific auth (separate from admin `useAuth`)

**API client additions:**
- [ ] `packages/api-client/customer-auth.ts` — register, login, logout
- [ ] `packages/api-client/customer-profile.ts` — profile, addresses
- [ ] Cart is frontend-only (no API until checkout)

### Phase 4 — Checkout & Payments
> Goal: end-to-end purchase flow

- [ ] Stripe integration — `POST /checkout` creates PaymentIntent
- [ ] Stripe webhook handler — `POST /webhooks/stripe` updates `paymentStatus`
- [ ] Order creation on payment success
- [ ] Stock decrement on confirmed payment (not on cart add)
- [ ] Email confirmation on order placed (BullMQ email job already exists ✅)

### Phase 5 — Admin Security Hardening
> Goal: production-grade admin access control

- [ ] TOTP MFA for admin users (`speakeasy` + QR code setup)
- [ ] Audit log table — log every admin write action (who, what, when, ip, before/after)
- [ ] Nginx IP allowlist for `app.infra-pro.com`
- [ ] Separate Redis namespaces: `admin:session:*` vs `customer:session:*`
- [ ] Stricter rate limits on admin auth (3 attempts / 15min)
- [ ] Admin session expiry shorter (15m access / 1h refresh)

### Phase 6 — Storefront Performance & SEO
- [ ] ISR on product pages (`revalidate: 60`)
- [ ] Server Components for product listing
- [ ] `sitemap.xml` generation
- [ ] `robots.txt`
- [ ] Open Graph meta tags on product pages
- [ ] Lighthouse CI target: performance > 90

---

## Tech Decisions Log

| Decision | Chosen | Reason |
|----------|--------|--------|
| Monorepo tool | Turborepo + pnpm workspaces | Task caching, incremental builds, simple config |
| Frontend framework | Next.js 16 (both apps) | Consistent, shared knowledge, App Router |
| HTTP client | Axios (not fetch) | Interceptors for token refresh queue, `axios-retry`, better error handling, TypeScript generics |
| Separate auth tables | Yes (`customers` + `admin_users`) | Security isolation, schema flexibility |
| Separate JWT secrets | Yes (4 secrets total) | Compromise of one doesn’t affect the other |
| Cart storage | localStorage → Redis on login | No backend needed for guest cart |
| Payment | Stripe | Industry standard, webhook-driven status updates |
| MFE pattern | No — two separate apps | MFE solves org-scale problems; overkill here |
| Search | Client-side filter now; Meilisearch later | Good enough for small catalog |
| Request cancellation | `AbortController` with axios `signal` | Native API, `CancelToken` deprecated since axios 0.22 |

---

## Environment Variables to Add

```env
# Backend — Phase 2
CUSTOMER_JWT_ACCESS_SECRET=
CUSTOMER_JWT_REFRESH_SECRET=
CUSTOMER_JWT_ACCESS_EXPIRY=15m
CUSTOMER_JWT_REFRESH_EXPIRY=30d

# Backend — Phase 4
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Storefront — Phase 3
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Nginx Changes Needed (Phase 3)

```nginx
# storefront.com → storefront:3001
server_name infra-pro.com;
proxy_pass http://storefront:3001;

# app.infra-pro.com → admin:3000 (IP restricted)
server_name app.infra-pro.com;
allow 10.0.0.0/8;   # Internal/VPN only
deny all;
proxy_pass http://admin:3000;
```

---

## Docker Compose Changes Needed (Phase 3)

```yaml
storefront:
  build:
    context: ./apps/storefront
    target: production
  container_name: ecommerce_storefront
  environment:
    - NEXT_PUBLIC_API_URL=https://api.infra-pro.com
  healthcheck:
    test: ["CMD", "wget", "--spider", "http://localhost:3001/"]
```
