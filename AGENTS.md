<!-- BEGIN:project-rules -->
# InfraPro Monorepo — AI Agent Guidelines

## CRITICAL: Read Before Acting

This is a **production ecommerce monorepo**. Every change has downstream consequences.
Before making any change, identify which app/package is affected and check the relevant AGENTS.md.

**Sub-agent rule files (ALWAYS check these for domain-specific rules):**
- `apps/backend/AGENTS.md` or `backend/AGENTS.md` — Express API rules
- `apps/admin/AGENTS.md` or `frontend/AGENTS.md` — Admin dashboard rules
- `apps/storefront/AGENTS.md` — Storefront rules (once created)

> If a sub-AGENTS.md exists for the scope of work, its rules take precedence over this file.

---

## Repository Structure

```
ecommerce-infra/                 ← YOU ARE HERE
├── apps/                        ← After Phase 1 restructure
│   ├── admin/                   ← Next.js 16 admin dashboard (port 3000)
│   ├── storefront/              ← Next.js 16 customer storefront (port 3001)
│   └── backend/                 ← Express 5 API (port 4000)
├── packages/                    ← Shared code (no app-specific logic)
│   ├── shared-types/            ← TypeScript interfaces ONLY, zero runtime deps
│   ├── ui/                      ← Shared React components
│   └── api-client/              ← Shared API request helpers
├── nginx/                       ← nginx.conf, SSL certs, conf.d/
├── monitoring/                  ← Prometheus + Grafana config
├── docker-compose.yml           ← All services wired together
├── plan.md                      ← Project roadmap and phase tracker
├── turbo.json                   ← Turborepo pipeline (after Phase 1)
└── pnpm-workspace.yaml          ← Workspace packages (after Phase 1)
```

**Before Phase 1 restructure is complete:**
- Admin dashboard is at `frontend/` (not `apps/admin/`)
- Backend is at `backend/` (not `apps/backend/`)
- No `packages/` directory yet

---

## Domain Routing

| Domain | Target Container | Port | Restriction |
|--------|-----------------|------|-------------|
| `infra-pro.com` | `storefront` | 3001 | Public |
| `app.infra-pro.com` | `admin` / `frontend` | 3000 | VPN/IP restricted |
| `api.infra-pro.com` | `backend` | 4000 | Public (rate limited) |

**Never serve the admin app on a public domain. Never skip nginx for direct container access in production.**

---

## Auth Architecture — Two Separate User Types

This project uses **two separate auth systems**. Treat them as completely independent.

### Admin Users (`users` table / `admin_users` table)
- Source of truth: `backend/src/modules/user/user.model.ts`
- JWT secrets: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- Roles: `admin`, `super_admin`
- Auth routes: `POST /api/v1/auth/*`
- Middleware: `authenticate` from `auth.middleware.ts`
- Redis namespace: `admin:session:*`

### Customers (`customers` table) — Phase 2+
- Source of truth: `backend/src/modules/customer/customer.model.ts`
- JWT secrets: `CUSTOMER_JWT_ACCESS_SECRET`, `CUSTOMER_JWT_REFRESH_SECRET`
- No roles — all customers are equal
- Auth routes: `POST /api/v1/customer/auth/*`
- Middleware: `customerAuthenticate` from `customer-auth.middleware.ts`
- Redis namespace: `customer:session:*`

**Rules:**
- NEVER use admin JWT secret to sign customer tokens
- NEVER use `authenticate` middleware on customer routes
- NEVER use `customerAuthenticate` middleware on admin routes
- NEVER mix admin users and customers in the same query or service method

---

## Package Dependency Rules

### `packages/shared-types`
- TypeScript interfaces and type aliases ONLY
- Zero `dependencies` in package.json (devDependencies allowed for build tooling)
- No React, no Express, no Sequelize imports
- Both `apps/admin` and `apps/storefront` import from here

### `packages/ui`
- React components only — no API calls, no auth logic, no routing
- Depends on `@infrapro/shared-types` only from internal packages
- Must work in both Next.js apps without modification
- No `useRouter`, no `useAuth`, no `useToast` — those are app-level

### `packages/api-client`
- Exports `createApiClient(config)` factory — returns a configured **axios instance** with interceptors attached
- Exports `ApiError` class — the only error type domain files ever throw or catch
- Exports token helpers: `getAccessToken`, `setAccessToken`, `getRefreshToken`, `setRefreshToken`, `clearAuth`
- No React — must be usable in non-React contexts (e.g. scripts, Node.js)
- No app-specific business logic
- Auth helpers must support both admin tokens and customer tokens (separate instances, separate token keys)
- `axios-retry` configured on the instance: retries on 5xx and `ECONNABORTED` with exponential backoff — never retries 4xx
- Each app (`admin`, `storefront`) calls `createApiClient()` with its own `baseURL` and token getters

---

## Infrastructure Constraints

### Docker / docker-compose
- Every new app service must have a `healthcheck`
- Every new app service must have `restart: unless-stopped`
- Container names follow: `ecommerce_{service}` pattern
- Never expose ports directly to `0.0.0.0` — always `127.0.0.1:{port}:{port}` for internal services
- Nginx is the ONLY service that binds to `0.0.0.0:80` and `0.0.0.0:443`

### Nginx
- Always update `nginx.conf` when adding a new upstream service
- New upstreams follow the pattern in `nginx/nginx.conf` — `upstream {name}_upstream { ... }`
- Admin routes (`app.infra-pro.com`) must have IP allowlist for production
- All HTTP (port 80) redirects to HTTPS — never serve content on port 80
- CORS is handled at Nginx level for `api.infra-pro.com` — do NOT add CORS headers in Express

### Migrations
- All schema changes go through Sequelize CLI migrations in `backend/migrations/`
- Never modify an existing migration — always create a new one
- Migration file naming: `YYYYMMDDHHMMSS-{action}-{table}.js`
- Always include both `up` and `down` methods

---

## Monorepo Tooling (Turborepo — Phase 1+)

### Pipeline Rules
- `build` depends on upstream `build`: `{ "dependsOn": ["^build"] }`
- `test` does NOT depend on build — run tests from source with ts-jest/vitest
- `lint` is independent — run in parallel
- Never define a pipeline task that has circular dependencies

### Import Rules
```typescript
// ✅ Correct — use package name
import { Order, Product } from "@infrapro/shared-types";
import { Button } from "@infrapro/ui";
import { request, ApiError } from "@infrapro/api-client";

// ❌ Wrong — never use relative paths across package boundaries
import { Order } from "../../packages/shared-types/src/order";
```

### Package Naming
- Packages use `@infrapro/` scope: `@infrapro/shared-types`, `@infrapro/ui`, `@infrapro/api-client`
- Apps are NOT published — `private: true` in their package.json
- Packages set `"main"` to the TypeScript source entry during development

---

## Testing Requirements

### Never skip tests for new code.

| Layer | Test location | Tool |
|-------|--------------|------|
| Backend service | `apps/backend/tests/unit/modules/{name}/` | Jest |
| Backend controller | `apps/backend/tests/unit/modules/{name}/` | Jest |
| Backend repository | `apps/backend/tests/unit/modules/{name}/` | Jest |
| Backend integration | `apps/backend/tests/integration/` | Jest + Supertest |
| Admin pages | `apps/admin/tests/pages/` | Vitest + RTL + MSW |
| Admin components | `apps/admin/tests/components/` | Vitest + RTL |
| Admin API lib | `apps/admin/tests/lib/` | Vitest |
| Storefront pages | `apps/storefront/tests/pages/` | Vitest + RTL + MSW |
| Shared types | `packages/shared-types/tests/` | Vitest (contract/type tests) |

**Coverage targets:** Backend 80% | Frontend apps 80% | API layer 90%

---

## Security Rules

- **Never hardcode secrets** — always use `process.env.*` and validate in `config/env.ts`
- **Never log passwords, tokens, or PII** — scrub before Winston
- **Never return password hashes in API responses** — strip in `toJSON()` or response DTO
- **Stripe webhook must verify signature** — use `stripe.webhooks.constructEvent()`
- **Admin endpoints must always use** `authenticate` + `authorize(["admin"])` middleware
- **Customer endpoints must always use** `customerAuthenticate` middleware
- **Public read endpoints** (product listing, product detail) require NO auth middleware

---

## Common Mistakes to Avoid

1. **Using `import AppError from "..."` — it's a named export, not default**
2. **Adding try/catch in Express 5 controllers — not needed, errors auto-propagate**
3. **Using `<Context.Provider value={...}>` in React 19 — use `<Context value={...}>`**
4. **Using admin `authenticate` middleware on customer-facing routes**
5. **Importing from `packages/ui` inside `packages/api-client` — creates React dependency in API client**
6. **Directly modifying existing migrations — always create a new one**
7. **Skipping the `down` method in migrations**
8. **Using `any` TypeScript type — use `unknown` with type guards**
9. **Exposing admin container port without IP restriction in nginx**
10. **Adding CORS headers in Express — handled by nginx**
11. **Calling `axios.get/post/...` directly — always use the `apiClient` instance from `packages/api-client`**
12. **Using axios `CancelToken` — deprecated; use `AbortController` with `{ signal }` option**
13. **Catching `AxiosError` in components or domain files — the interceptor converts it to `ApiError` first**
14. **Configuring `axios-retry` to retry on 4xx — only retry 5xx and network errors**
15. **Creating a new axios instance per file — always import the shared configured instance**

---

## When Adding a New Backend Module

Follow this checklist in order:
1. `{name}.types.ts` — interfaces and DTOs
2. `{name}.model.ts` — Sequelize model
3. `migrations/TIMESTAMP-create-{name}.js` — migration
4. `{name}.repository.ts` — DB queries
5. `{name}.service.ts` — business logic
6. `{name}.controller.ts` — HTTP handlers (no try/catch)
7. `{name}.routes.ts` — Router with middleware
8. Register routes in `app.ts`
9. Unit tests: service, controller, repository
10. Integration tests: validation schemas
11. Update `backend/AGENTS.md` API reference

## When Adding a New Frontend Page

Follow this checklist in order:
1. Add any new types to `packages/shared-types/` (or `lib/types.ts` pre-restructure)
2. Add API function to `packages/api-client/` (or `lib/api/{name}.ts` pre-restructure)
3. Export from barrel `lib/api/index.ts`
4. Add Zod schema to `lib/validators.ts`
5. Add MSW handler to `tests/mocks/handlers.ts`
6. Create page component in `app/dashboard/{name}/page.tsx`
7. Add page test in `tests/pages/`
8. Add link to sidebar if needed
9. Update `AGENTS.md`
<!-- END:project-rules -->
