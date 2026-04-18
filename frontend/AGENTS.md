<!-- BEGIN:project-rules -->
# InfraPro Frontend — AI Agent Guidelines

## Critical: Next.js 16 Breaking Changes

This project uses **Next.js 16 with React 19** and **Tailwind CSS 4**.

⚠️ **This is NOT the Next.js you know from training data.**

- APIs, conventions, and file structure differ from Next.js 14/15
- Always check `node_modules/next/dist/docs/` before using Next.js APIs
- Tailwind CSS 4 has different configuration than v3
- React 19 has different hooks behavior than React 18

## Project Architecture

### Stack
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4, Lucide React icons
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library + MSW (Mock Service Worker)
- **Validation**: Zod for runtime type checking

### Infrastructure Context
This frontend connects to a **layered architecture backend**:
```
Frontend → Nginx → Express Backend (Routes → Controller → Service → Repository → Model)
```

- API Base: `https://api.infra-pro.com/api/v1`
- Auth: JWT access + refresh tokens, stored in localStorage
- WebSocket: Not currently used

## API Client Structure

All API calls use the modular structure in `lib/api/`:

```
lib/api/
├── client.ts    # HTTP client, tokens, request(), ApiError
├── auth.ts      # login, register, logout
├── users.ts     # getUsers
├── products.ts  # CRUD operations
└── index.ts     # Barrel exports
```

**Always import from the barrel:**
```typescript
import { login, getProducts, ApiError } from "@/lib/api";
```

**Never** import directly from client.ts unless you need low-level utilities.

## Coding Standards

### TypeScript
- Strict mode enabled
- Use explicit return types on public functions
- Prefer `interface` over `type` for object shapes
- Use `zod` schemas for API validation (in `lib/validators.ts`)

### Components
- Use functional components with hooks
- Props interfaces named `{ComponentName}Props`
- Place shared UI components in `components/ui/`
- Place feature components in `components/{feature}/`

### Styling
- Use Tailwind CSS utilities only
- No inline styles (except dynamic values)
- Use `clsx` for conditional classes
- Follow existing color palette (indigo primary, gray neutrals)

### Error Handling
- Use `ApiError` class from `lib/api` for API errors
- Always show user-friendly errors via `useToast()`
- Log unexpected errors to console for debugging

### Testing
**All new code must include tests:**

| Type | Location | Tool |
|------|----------|------|
| Unit | `tests/lib/*.test.ts` | Vitest |
| Component | `tests/components/*.test.tsx` | RTL + jsdom |
| Page | `tests/pages/*.test.tsx` | RTL + MSW |
| Contract | `tests/contracts/*.test.ts` | Zod |
| E2E | `tests/e2e/*.spec.ts` | Playwright |

**Test Coverage Targets:**
- Global: 80%
- API layer (`lib/api/`): 90%

### State Management
- Local state: `useState`, `useReducer`
- Global state: React Context (Auth, Toast)
- Server state: Direct API calls with SWR-style caching not yet implemented
- Form state: Controlled inputs with `useState`

### Routing
- App Router structure in `app/`
- Route groups: `(auth)/` for auth pages, `dashboard/` for protected
- Protected routes use `AuthProvider` check in layout

## Common Patterns

### API Call in Component
```typescript
const [data, setData] = useState<Product[]>([]);
const [loading, setLoading] = useState(false);
const toast = useToast();

useEffect(() => {
  setLoading(true);
  getProducts()
    .then(setData)
    .catch((err) => toast.error(err.message))
    .finally(() => setLoading(false));
}, []);
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
    const msg = err instanceof ApiError ? err.message : "Failed";
    toast.error(msg);
  } finally {
    setLoading(false);
  }
};
```

### Modal Pattern
- Use `ConfirmModal` for confirmations
- Use custom modals for forms (see `ProductModal`)
- Always handle close via onClose prop

## Testing Requirements

Before submitting changes:

1. **Run unit tests:** `npm test`
2. **Check coverage:** `npm run test:coverage`
3. **E2E tests (if applicable):** `npm run test:e2e`
4. **Contract tests:** Ensure Zod schemas validate

## File Organization

```
frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Route group (no layout)
│   ├── dashboard/         # Protected routes
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Shared UI (Button, Input, etc.)
│   └── products/          # Feature components
├── lib/
│   ├── api/               # API client modules
│   ├── types.ts           # Shared TypeScript types
│   ├── validators.ts      # Zod schemas
│   ├── auth-context.tsx   # Auth state
│   └── toast-context.tsx  # Notifications
├── tests/
│   ├── lib/               # API unit tests
│   ├── components/        # Component tests
│   ├── pages/             # Page integration tests
│   ├── contracts/         # Zod validation tests
│   ├── e2e/               # Playwright tests
│   ├── load/              # k6 load tests
│   ├── mocks/             # MSW handlers
│   └── setup.ts           # Test setup
├── public/                # Static assets
└── styles/                # Global CSS
```

## Docker/Deployment Context

- Frontend builds as **Docker standalone output**
- Nginx serves as reverse proxy with SSL
- All services orchestrated via docker-compose
- Local domain: `app.infra-pro.com` (requires /etc/hosts entry)

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
```

## Default Admin Credentials (for testing)
- Email: `admin@test.com`
- Password: `Test1234!`

## Grafana Credentials (monitoring)
- URL: `http://localhost:3001`
- User: `admin`
- Password: `admin`

## Performance Budgets (Lighthouse CI)

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- LCP: < 2.5s
- FCP: < 1.8s

## Pre-Commit Checklist

- [ ] No `console.log` statements (except in catch blocks)
- [ ] No `debugger` statements
- [ ] All imports use `@/` path alias
- [ ] Components have proper TypeScript types
- [ ] New API functions added to `lib/api/index.ts`
- [ ] Tests added for new functionality
- [ ] No trailing whitespace
- [ ] Zod schemas updated for new API responses

<!-- END:project-rules -->
