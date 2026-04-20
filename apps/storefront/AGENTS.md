<!-- BEGIN:project-rules -->
# InfraPro Storefront — AI Agent Guidelines

## Critical: Next.js 16 + React 19 Breaking Changes

This project uses **Next.js 16 with React 19** and **Tailwind CSS 4**.

⚠️ **This is NOT the Next.js/React you know from training data.**

- APIs, conventions, and file structure differ from Next.js 14/15
- Always check `node_modules/next/dist/docs/` before using Next.js APIs
- Tailwind CSS 4 has different configuration than v3
- **React 19 Context API changed** — use `<Context value={...}>` NOT `<Context.Provider value={...}>`

```tsx
// ✅ React 19
<CartContext value={value}>{children}</CartContext>

// ❌ React 18 (old)
<CartContext.Provider value={value}>{children}</CartContext.Provider>
```

## Project Architecture

### Stack
- **Framework**: Next.js 16 (App Router), `output: "standalone"` for Docker
- **UI**: React 19, Tailwind CSS 4, Lucide React icons, `clsx`
- **HTTP Client**: Axios (with interceptors, retry, token refresh queue)
- **Testing**: Vitest + Testing Library + MSW (Mock Service Worker) + Playwright
- **Validation**: Zod for runtime API contract validation

### Infrastructure Context
```
Storefront → Nginx → Express Backend (Routes → Controller → Service → Repository → Model)
```

- **Domain**: `https://infra-pro.com` (storefront)
- **API Base**: `https://api.infra-pro.com/api/v1`
- **Admin Dashboard**: `https://app.infra-pro.com` (separate Next.js app)

### Auth Architecture — STRICT SEPARATION

This is a **customer-facing storefront**. It uses **completely separate auth** from the admin dashboard:

| Aspect | Storefront (Customers) | Admin Dashboard |
|--------|----------------------|-----------------|
| User table | `customers` | `users` / `admin_users` |
| JWT secret | `CUSTOMER_JWT_*` | `JWT_*` |
| localStorage keys | `customerAccessToken`, `customerRefreshToken`, `customer` | `accessToken`, `refreshToken`, `user` |
| Context | `CustomerAuthContext` | `AuthContext` |
| Middleware | `customerAuthenticate` | `authenticate` |

**CRITICAL RULES:**
- **NEVER** mix customer and admin auth
- **NEVER** use admin JWT secret to sign customer tokens
- **NEVER** use `authenticate` middleware on customer routes
- **NEVER** use `customerAuthenticate` middleware on admin routes

## API Client Structure

All API calls use the modular structure in `lib/api/`:

```
lib/api/
├── client.ts          # axios instance, ApiError, interceptors, token helpers
├── customer-auth.ts   # register, login, logout, forgotPassword, resetPassword
├── products.ts        # getProducts, getProduct, searchProducts
├── categories.ts      # getCategories, getCategoryBySlug
├── orders.ts          # createOrder, getCustomerOrders, getOrder
└── index.ts           # Barrel exports (always import from here)
```

**Always import from the barrel:**
```typescript
import { login, getProducts, getProduct, ApiError } from "@/lib/api";
```

**Never** import directly from `client.ts` unless you need low-level utilities.

### Axios Client Architecture (client.ts)

`client.ts` exports a configured **axios instance** for customer API calls.

**Never** call `axios.get/post/...` directly. Always use `apiClient.get/post/...`.

```typescript
// ✅ Correct
import { apiClient } from "./client";
const data = await apiClient.get<Product>(`/products/${id}`);

// ❌ Wrong — bypasses interceptors and error normalization
import axios from "axios";
const data = await axios.get(...);
```

### Axios Instance Config

```typescript
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  timeout: 15_000,             // 15s hard timeout
  headers: { "Content-Type": "application/json" },
  withCredentials: false,      // JWT in Authorization header, not cookies
});
```

### Interceptors — Rules

**Request interceptor** — injects `Authorization: Bearer <customerToken>`:
```typescript
apiClient.interceptors.request.use((config) => {
  const token = getCustomerAccessToken();  // customer-specific!
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

**Response interceptor** — handles 401 with refresh token queue:
- Uses `refreshPromise` to queue concurrent 401s
- Calls `POST /customer/auth/refresh` **once**
- On refresh failure: `clearCustomerAuth()` → redirect to `/login`
- Always transforms `AxiosError` → `ApiError`

### Token Management (Customer-Specific)

Tokens stored in `localStorage` with **customer-specific keys**:
- `customerAccessToken` — JWT access token (15m expiry)
- `customerRefreshToken` — JWT refresh token (7d expiry)
- `customer` — JSON stringified customer object
- `cart` — localStorage-persisted cart (see CartContext)

### Request Cancellation

Use `AbortController` for components that unmount before requests complete:

```typescript
useEffect(() => {
  const controller = new AbortController();
  load(controller.signal);
  return () => controller.abort();
}, []);

async function load(signal: AbortSignal) {
  await apiClient.get("/products", { signal });
}
```

**Never** use deprecated `CancelToken`.

## Contexts

### `useCustomerAuth()` — `lib/context/CustomerAuthContext.tsx`

Customer-specific auth context (completely separate from admin `useAuth`):

```typescript
const { customer, isLoading, isAuthenticated, login, register, logout } = useCustomerAuth();
// customer: Customer | null
// isLoading: boolean (true during initial localStorage restore)
// isAuthenticated: boolean (!!customer)
```

**Must be used inside `<CustomerAuthProvider>`** (already in root layout).

### `useCart()` — `lib/context/CartContext.tsx`

Cart state with localStorage persistence:

```typescript
const { items, totalItems, totalPrice, addItem, removeItem, updateQuantity, clearCart } = useCart();
// items: CartItem[]
// totalItems: number
// totalPrice: number
// addItem: (product, quantity?) => void
// removeItem: (productId) => void
// updateQuantity: (productId, quantity) => void
// clearCart: () => void
```

Cart is **frontend-only** (no API calls) until checkout. Merges with server cart on customer login.

**Must be used inside `<CartProvider>`** (already in root layout).

## Coding Standards

### TypeScript
- Strict mode enabled
- Explicit return types on public functions
- Prefer `interface` over `type` for object shapes
- Use `zod` schemas for API validation (in `lib/validators.ts`)
- `@/` path alias maps to the storefront root

### Components
- Functional components with hooks only
- Props interface named `{ComponentName}Props` or inline `interface Props`
- Shared UI → import from `@infrapro/ui` package
- Feature-specific → `components/{feature}/`
- Layout chrome → `components/layout/`

### Styling
- Tailwind CSS utilities only
- No inline styles (except truly dynamic values)
- Use `clsx` for conditional classes
- Color palette: indigo primary, gray neutrals, emerald success, red error

### Error Handling
- Use `ApiError` (from `@/lib/api`) to detect API errors
- Show errors via toast or inline messages
- Catch `ApiError` specifically: `err instanceof ApiError ? err.message : "Unexpected error"`

## Page Structure

```
app/
├── layout.tsx                 # Root layout (CartProvider + CustomerAuthProvider)
├── page.tsx                   # Homepage (hero, featured products, categories)
├── globals.css                # Tailwind base + custom styles
├── products/
│   ├── page.tsx               # Product listing (grid, search, filter, pagination)
│   └── [id]/
│       ├── page.tsx           # Product detail with ISR
│       └── AddToCartButton.tsx # Client component for add-to-cart
├── cart/
│   └── page.tsx               # Shopping cart (quantity update, remove, subtotal)
├── checkout/
│   └── page.tsx               # Checkout form (shipping address, order summary)
├── orders/
│   └── [id]/
│       └── page.tsx           # Order confirmation page
├── account/
│   └── orders/
│       └── page.tsx           # Order history (requires auth)
├── login/
│   └── page.tsx               # Customer login
├── register/
│   └── page.tsx               # Customer registration
└── forgot-password/
    └── page.tsx               # Password reset request
```

### Route Groups

- **Public routes**: `/`, `/products`, `/products/[id]`, `/cart` — no auth required
- **Auth routes**: `/login`, `/register`, `/forgot-password` — redirect to `/account/orders` if already logged in
- **Protected routes**: `/checkout`, `/account/*`, `/orders/[id]` — redirect to `/login` if not authenticated

### ISR (Incremental Static Regeneration)

Product detail pages use ISR for performance:

```typescript
// app/products/[id]/page.tsx
export const revalidate = 60; // Revalidate every 60 seconds
export const dynamicParams = true; // Generate pages for unknown IDs on-demand
```

Always handle `notFound()` for invalid product IDs.

## Common Patterns

### Product Listing with Search/Filter

```typescript
const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState("");
const [category, setCategory] = useState("");
const [page, setPage] = useState(1);

const loadProducts = useCallback(async () => {
  setLoading(true);
  try {
    const response = await getProducts({
      page,
      limit: 12,
      search: search || undefined,
      category: category || undefined,
    });
    setProducts(response.data);
  } finally {
    setLoading(false);
  }
}, [page, search, category]);

useEffect(() => { loadProducts(); }, [loadProducts]);
```

### Add to Cart

```typescript
const { addItem } = useCart();

const handleAddToCart = () => {
  addItem({
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
  }, quantity);
  // Show success feedback
};
```

### Protected Route Guard

```typescript
// In protected page component
const { isAuthenticated, isLoading } = useCustomerAuth();
const router = useRouter();

useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push("/login");
  }
}, [isAuthenticated, isLoading, router]);

if (isLoading || !isAuthenticated) {
  return <LoadingSkeleton />;
}
```

### Form Submission

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    await register(formData);
    router.push("/account/orders");
  } catch (err) {
    setError(err instanceof ApiError ? err.message : "Registration failed");
  } finally {
    setLoading(false);
  }
};
```

## File Organization

```
storefront/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with CartProvider + CustomerAuthProvider
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Tailwind styles
│   ├── products/               # Product pages
│   ├── cart/                   # Shopping cart
│   ├── checkout/               # Checkout flow
│   ├── orders/                 # Order confirmation
│   ├── account/                # Customer account pages
│   ├── login/                  # Customer login
│   ├── register/               # Customer registration
│   └── forgot-password/        # Password reset
├── components/                 # React components
│   ├── layout/                 # Header, footer, navigation
│   └── products/               # Product-related components
├── lib/
│   ├── api/                    # API client modules
│   │   ├── client.ts           # axios instance
│   │   ├── customer-auth.ts    # Customer auth API
│   │   ├── products.ts         # Product API
│   │   ├── categories.ts       # Category API
│   │   ├── orders.ts           # Order API
│   │   └── index.ts            # Barrel exports
│   ├── context/                # React Context providers
│   │   ├── CartContext.tsx     # Cart state (localStorage)
│   │   ├── CustomerAuthContext.tsx # Customer auth state
│   │   └── index.ts            # Barrel exports
│   └── validators.ts           # Zod schemas
├── tests/                      # Test files
└── public/                     # Static assets
```

## Shared Types

Key interfaces from `@infrapro/shared-types`:

```typescript
Customer              // { id, email, name, phone?, emailVerified, createdAt, updatedAt }
CustomerAuthResponse  // { customer: Customer, accessToken, refreshToken }
Product               // { id, name, description?, price, stock, sku, isActive, images?, categoryId?, category?, createdAt, updatedAt }
Category              // { id, name, slug, description?, isActive, createdAt, updatedAt }
CartItem              // { productId, name, price, quantity, image? }
Order                 // { id, customerId, status, paymentStatus, totalAmount, items, shippingAddress, createdAt, updatedAt }
OrderItem             // { id, productId, quantity, unitPrice, product? }
PaginatedResponse<T>  // { data: T[], total, page, limit, totalPages }
```

## Testing

**All new code must include tests:**

| Type | Location | Tool |
|------|----------|------|
| Unit | `tests/lib/*.test.{ts,tsx}` | Vitest |
| Component | `tests/components/*.test.tsx` | RTL + jsdom |
| Page | `tests/pages/*.test.tsx` | RTL + MSW |
| Contract | `tests/contracts/*.test.ts` | Zod |
| E2E | `tests/e2e/*.spec.ts` | Playwright |

**Coverage Targets:** Global 80%, API layer (`lib/api/`) 90%

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
NEXT_PUBLIC_SITE_URL=https://infra-pro.com
```

## Docker/Deployment Context

- `next.config.ts`: `output: "standalone"` for Docker
- Nginx routes `infra-pro.com` → storefront container (port 3001)
- Separate from admin dashboard at `app.infra-pro.com`

## Common Mistakes to Avoid

1. **Mixing customer and admin auth** — they are completely separate systems
2. **Using `Context.Provider`** — use React 19 `<Context value={...}>` syntax
3. **Calling `axios.get/post` directly** — always use `apiClient` instance
4. **Using deprecated `CancelToken`** — use `AbortController` with `{ signal }`
5. **Catching `AxiosError` in domain files** — only catch `ApiError`
6. **Cart persistence in backend** — cart is localStorage-only until checkout
7. **Forgetting ISR revalidation** — product detail pages need `revalidate` export
8. **Using admin JWT secrets** — customer tokens use `CUSTOMER_JWT_*` secrets
9. **Redirecting to `/dashboard`** — storefront uses `/account/orders` as post-auth destination
10. **Using `user` localStorage key** — storefront uses `customer` key

## Pre-Commit Checklist

- [ ] No `console.log` (except in `catch` blocks)
- [ ] No `debugger` statements
- [ ] All imports use `@/` path alias
- [ ] New API functions exported from `lib/api/index.ts`
- [ ] React 19 Context syntax: `<Context value={...}>` not `<Context.Provider>`
- [ ] Tests added for new functionality
- [ ] Zod schemas updated for new API shapes
- [ ] Using customer auth keys (`customerAccessToken`, not `accessToken`)
- [ ] No direct `axios` calls — use `apiClient` instance
- [ ] No `CancelToken` usage — use `AbortController`
- [ ] Product detail pages have ISR `revalidate` export
- [ ] Cart operations use `useCart()` from CartContext

<!-- END:project-rules -->
