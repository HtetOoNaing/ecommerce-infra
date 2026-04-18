<!-- BEGIN:project-rules -->
# InfraPro Frontend — AI Agent Guidelines

## Critical: Next.js 16 + React 19 Breaking Changes

This project uses **Next.js 16 with React 19** and **Tailwind CSS 4**.

⚠️ **This is NOT the Next.js/React you know from training data.**

- APIs, conventions, and file structure differ from Next.js 14/15
- Always check `node_modules/next/dist/docs/` before using Next.js APIs
- Tailwind CSS 4 has different configuration than v3
- **React 19 Context API changed** — use `<Context value={...}>` NOT `<Context.Provider value={...}>`

```tsx
// ✅ React 19
<ToastContext value={value}>{children}</ToastContext>

// ❌ React 18 (old)
<ToastContext.Provider value={value}>{children}</ToastContext.Provider>
```

## Project Architecture

### Stack
- **Framework**: Next.js 16 (App Router), `output: "standalone"` for Docker
- **UI**: React 19, Tailwind CSS 4, Lucide React icons, `clsx`
- **Charts**: Recharts (mocked in tests — see `tests/setup.ts`)
- **Testing**: Vitest + Testing Library + MSW (Mock Service Worker) + Playwright
- **Validation**: Zod for runtime API contract validation

### Infrastructure Context
```
Frontend → Nginx → Express Backend (Routes → Controller → Service → Repository → Model)
```

- **API Base**: `https://api.infra-pro.com/api/v1`
- **Auth**: JWT access + refresh tokens stored in `localStorage` under keys `accessToken`, `refreshToken`, `user`
- **Auto-refresh**: `client.ts` automatically retries 401 responses using the refresh token before redirecting to `/login`
- **WebSocket**: Not currently used

## API Client Structure

All API calls use the modular structure in `lib/api/`:

```
lib/api/
├── client.ts    # request(), ApiError, token get/set/clear, loginWithTokens, registerWithTokens
├── auth.ts      # login, register, logout, forgotPassword, resetPassword
├── users.ts     # getUsers
├── products.ts  # getProducts, getProduct, createProduct, updateProduct, deleteProduct
└── index.ts     # Barrel exports (always import from here)
```

**Always import from the barrel:**
```typescript
import { login, forgotPassword, getProducts, getProduct, ApiError } from "@/lib/api";
```

**Never** import directly from `client.ts` unless you need low-level utilities like `request()` or `clearAuth()`.

### Token Management (client.ts)

Tokens are stored in `localStorage` with these exact keys:
- `accessToken` — JWT access token (15m expiry)
- `refreshToken` — JWT refresh token (7d expiry)
- `user` — JSON stringified `AuthUser` object

On 401 response, `client.ts` automatically attempts `POST /auth/refresh`, retries the original request, and redirects to `/login` if refresh fails.

## Contexts

### `useAuth()` — `lib/auth-context.tsx`

```typescript
const { user, isLoading, isAuthenticated, login, register, logout } = useAuth();
// user: AuthUser | null
// isLoading: boolean (true during initial localStorage restore)
// isAuthenticated: boolean (!!user)
```

**Must be used inside `<AuthProvider>`** (already in root layout).

### `useToast()` — `lib/toast-context.tsx`

```typescript
const toast = useToast();
toast.success("Saved!");
toast.error("Failed to save");
toast.info("Loading...");
toast.toast("Custom", "success"); // generic
```

**Must be used inside `<ToastProvider>`** (already in root layout). Toasts auto-dismiss after 4 seconds.

## Coding Standards

### TypeScript
- Strict mode enabled
- Explicit return types on public functions
- Prefer `interface` over `type` for object shapes
- Use `zod` schemas for API validation (in `lib/validators.ts`)
- `@/` path alias maps to the frontend root (`./*`)

### Components
- Functional components with hooks only
- Props interface named `{ComponentName}Props` or inline `interface Props`
- Shared UI → `components/ui/`
- Feature-specific → `components/{feature}/`
- Layout chrome → `components/layout/`

### Styling
- Tailwind CSS utilities only
- No inline styles (except truly dynamic values)
- Use `clsx` for conditional classes
- Color palette: indigo primary, gray neutrals, emerald success, red error

### Error Handling
- Use `ApiError` (from `@/lib/api`) to detect API errors
- Show errors via `toast.error(err.message)`
- Catch `ApiError` specifically: `err instanceof ApiError ? err.message : "Unexpected error"`

### Testing
**All new code must include tests:**

| Type | Location | Tool |
|------|----------|------|
| Unit | `tests/lib/*.test.{ts,tsx}` | Vitest |
| Component | `tests/components/*.test.tsx` | RTL + jsdom |
| Page | `tests/pages/*.test.tsx` | RTL + MSW |
| Contract | `tests/contracts/*.test.ts` | Zod |
| E2E | `tests/e2e/*.spec.ts` | Playwright |
| Load | `tests/load/*.js` | k6 |

**Coverage Targets:** Global 80%, API layer (`lib/api/`) 90%

### State Management
- Local state: `useState`, `useReducer`
- Global state: React Context (`AuthProvider`, `ToastProvider`)
- Server state: Direct API calls — no SWR/React Query yet
- Form state: Controlled inputs with `useState`

### Routing
- App Router structure in `app/`
- `(auth)/` — auth route group with centering layout (login, register, forgot-password)
- `dashboard/` — protected routes; layout checks `isAuthenticated` and redirects to `/login`
- Protected routes guard lives in `app/dashboard/layout.tsx` using `useAuth()`

## Common Patterns

### Data Fetching in Component

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const toast = useToast();

const load = useCallback(async () => {
  try {
    const data = await getProducts();
    setProducts(data);
  } catch {
    // ApiError message already shown; silent fail is acceptable here
  } finally {
    setLoading(false);
  }
}, []);

useEffect(() => { load(); }, [load]);
```

### Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await createProduct(data);
    toast.success("Created!");
    router.push("/dashboard/products");
  } catch (err) {
    toast.error(err instanceof ApiError ? err.message : "Save failed");
  } finally {
    setLoading(false);
  }
};
```

### Modal Pattern
- Confirmation dialogs → `ConfirmModal` from `components/ui/confirm-modal`
- Form modals → custom component (see `components/products/product-modal.tsx`)
- Close via `onClose` prop; also closes on Escape key and backdrop click

## File Organization

```
frontend/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Route group — centers content via layout.tsx
│   │   ├── layout.tsx          # Centered auth card wrapper
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── dashboard/              # Protected routes
│   │   ├── layout.tsx          # Auth guard + Sidebar wrapper
│   │   ├── page.tsx            # Dashboard overview (charts, stats)
│   │   ├── products/page.tsx   # Product management
│   │   └── users/page.tsx      # User management
│   ├── globals.css             # Global CSS (Tailwind base + custom animations)
│   ├── layout.tsx              # Root layout (AuthProvider + ToastProvider)
│   └── page.tsx                # Root redirect
├── components/
│   ├── ui/                     # Shared UI primitives
│   │   ├── button.tsx          # Button (variant, isLoading)
│   │   ├── input.tsx           # Input (label, error)
│   │   ├── badge.tsx           # Status badge
│   │   ├── confirm-modal.tsx   # Confirmation dialog
│   │   ├── empty-state.tsx     # Empty list state
│   │   ├── pagination.tsx      # Page navigation
│   │   ├── skeleton.tsx        # Loading skeletons
│   │   └── spinner.tsx         # Loading spinner
│   ├── dashboard/              # Dashboard-specific components
│   │   ├── overview-chart.tsx  # Bar chart for stats
│   │   ├── product-status-chart.tsx # Pie chart for active/inactive
│   │   └── stats-card.tsx      # KPI stat card
│   ├── layout/
│   │   └── sidebar.tsx         # Collapsible sidebar nav
│   └── products/
│       └── product-modal.tsx   # Create/edit product modal
├── lib/
│   ├── api/                    # Modular API client
│   │   ├── client.ts           # request(), ApiError, token helpers, clearAuth
│   │   ├── auth.ts             # login, register, logout, forgotPassword, resetPassword
│   │   ├── users.ts            # getUsers
│   │   ├── products.ts         # getProducts, getProduct, createProduct, updateProduct, deleteProduct
│   │   └── index.ts            # Barrel — always import from here
│   ├── types.ts                # Shared TypeScript interfaces
│   ├── validators.ts           # Zod schemas for API contract validation
│   ├── auth-context.tsx        # AuthProvider, useAuth()
│   └── toast-context.tsx       # ToastProvider, useToast()
├── tests/
│   ├── lib/                    # Unit tests for lib/ (can be .ts or .tsx)
│   ├── components/             # UI component tests
│   ├── pages/                  # Page integration tests (RTL + MSW)
│   ├── contracts/              # API contract tests (Zod)
│   ├── e2e/                    # Playwright E2E specs
│   ├── load/                   # k6 load test scripts
│   ├── mocks/
│   │   ├── handlers.ts         # MSW request handlers + fixture data
│   │   └── server.ts           # MSW Node server
│   └── setup.ts                # Vitest setup (MSW, next/navigation mock, recharts mock)
└── public/                     # Static assets
```

## Shared Types (`lib/types.ts`)

Key interfaces:

```typescript
AuthUser      // { id, email, name?, role, isVerified }
LoginResponse // { user: AuthUser, accessToken, refreshToken }
User          // same shape as AuthUser
Product       // { id, name, description?, price, stock, sku, isActive, createdBy, createdAt, updatedAt }
CreateProductDto  // { name, description?, price, stock, sku }
UpdateProductDto  // all fields optional
DashboardStats    // { totalUsers, totalProducts, activeProducts, verifiedUsers }
PaginatedResponse<T> // { data, total, page, limit, totalPages } — ready for when pagination is added
```

## Known Schema Mismatch (TODO)

`lib/validators.ts` `UserSchema` uses `isActive: z.boolean().optional()` but the actual `User` type has `isVerified: boolean`. This was left optional as a workaround for contract tests. It should be updated to `isVerified: z.boolean()` and `AuthUserSchema` should also include `isVerified`.

## Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run all Vitest tests once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | Playwright E2E (headless) |
| `npm run test:e2e:ui` | Playwright with UI explorer |
| `npm run test:e2e:debug` | Playwright debug mode |
| `npm run test:lighthouse` | Lighthouse CI |
| `npm run test:load:auth` | k6 auth load test |
| `npm run test:load:products` | k6 products load test |
| `npm run test:all` | Vitest + E2E |

**E2E base URL**: `https://app.infra-pro.com` (or `E2E_BASE_URL` env var). Requires `/etc/hosts` entry locally.

## MSW Mock Fixtures (for tests)

Default test credentials:
- Email: `admin@test.com` / Password: `Test1234!`
- Defined in `tests/mocks/handlers.ts` as `mockUser`, `mockUsers`, `mockProducts`

## Docker/Deployment Context

- `next.config.ts`: `output: "standalone"` — produces self-contained Docker image
- Nginx as reverse proxy with SSL termination
- Orchestrated via docker-compose

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.infra-pro.com

# E2E tests (optional)
E2E_BASE_URL=https://app.infra-pro.com
```

## Grafana (monitoring)
- URL: `http://localhost:3001` — User: `admin` / Password: `admin`

## Performance Budgets (Lighthouse CI)

- Performance: > 90 | Accessibility: > 90 | Best Practices: > 90
- LCP: < 2.5s | FCP: < 1.8s

## Pre-Commit Checklist

- [ ] No `console.log` (except inside `catch` blocks)
- [ ] No `debugger` statements
- [ ] All imports use `@/` path alias
- [ ] New API functions exported from `lib/api/index.ts`
- [ ] React 19 Context syntax: `<Context value={...}>` not `<Context.Provider>`
- [ ] Tests added for new functionality
- [ ] Zod schemas in `lib/validators.ts` updated for new API shapes
- [ ] `isVerified` used for user verification state (not `isActive`)

<!-- END:project-rules -->
