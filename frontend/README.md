# InfraPro Dashboard

Next.js 16 admin dashboard for the e-commerce infrastructure platform. Features authentication, product management, user management, and real-time analytics.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **React**: React 19
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts
- **Testing**: Vitest + Testing Library + MSW

## Project Structure

```
app/
├── (auth)/              # Auth routes group (no layout)
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── dashboard/            # Protected dashboard routes
│   ├── page.tsx         # Overview with stats/charts
│   ├── products/
│   │   └── page.tsx     # Product CRUD
│   └── users/
│       └── page.tsx     # User list
├── layout.tsx           # Root layout with providers
└── page.tsx             # Root redirect to /login

components/
├── ui/                  # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── badge.tsx
│   ├── pagination.tsx
│   ├── skeleton.tsx
│   ├── empty-state.tsx
│   └── confirm-modal.tsx
├── layout/              # Layout components
│   └── sidebar.tsx      # Dashboard sidebar
├── dashboard/           # Dashboard-specific
│   ├── stats-card.tsx
│   ├── overview-chart.tsx
│   └── product-status-chart.tsx
└── products/
    └── product-modal.tsx # Create/Edit product

lib/
├── types.ts            # TypeScript interfaces
├── api.ts              # API client + HTTP layer
├── auth-context.tsx    # Auth state management
└── toast-context.tsx   # Toast notifications

tests/
├── components/         # UI component tests
├── lib/                # API and context tests
├── pages/              # Page integration tests
├── mocks/              # MSW handlers
│   ├── handlers.ts
│   └── server.ts
└── setup.ts            # Test configuration
```

## Quick Start

### Development Server
```bash
npm install
npm run dev
```

Open [https://app.infra-pro.com](https://app.infra-pro.com) (or http://localhost:3000 if running standalone)

### Environment Setup
```bash
# Copy environment file
cp .env.example .env.local

# Edit .env.local
NEXT_PUBLIC_API_URL=https://api.infra-pro.com
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (localhost:3000) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm test` | Run Vitest tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Tests with coverage report |

## Features

### Authentication
- JWT-based auth with automatic token refresh
- Protected routes via `dashboard/layout.tsx`
- Login, Register, Forgot Password flows
- Session persistence in localStorage

### Product Management
- List products with pagination and search
- Create/Edit products via modal
- Delete with confirmation
- Real-time status badges (Active/Inactive)

### User Management
- View all users (admin only)
- Role badges (admin/user)
- Verification status indicators

### Dashboard Overview
- Statistics cards (Total Users, Products, etc.)
- Bar chart: Overview (Users vs Products)
- Pie chart: Product Status (Active vs Inactive)

## Component Guide

### Button
```tsx
import Button from "@/components/ui/button";

<Button variant="primary" size="md" icon={<Plus />}>Save</Button>
<Button variant="danger" isLoading={saving}>Delete</Button>
<Button variant="secondary">Cancel</Button>
```

### Input
```tsx
import Input from "@/components/ui/input";

<Input label="Email" type="email" required />
<Input label="Name" error={errors.name} />
```

### Badge
```tsx
import Badge from "@/components/ui/badge";

<Badge variant="success">Active</Badge>
<Badge variant="danger">Inactive</Badge>
<Badge variant="warning">Pending</Badge>
```

## API Client

The `lib/api.ts` provides a typed HTTP client:

```typescript
import { login, getProducts, createProduct, ApiError } from "@/lib/api";

// Auth
const { user, accessToken } = await login(email, password);

// CRUD
const products = await getProducts();
const product = await createProduct({ name: "Item", price: 99.99, stock: 10, sku: "SKU-1" });

// Error handling
try {
  await deleteProduct(id);
} catch (err) {
  if (err instanceof ApiError) {
    console.log(err.message, err.status);
  }
}
```

## Authentication Flow

1. **Login**: `login()` stores tokens in localStorage + memory
2. **API Requests**: Automatic Bearer token header injection
3. **401 Handling**: Automatic token refresh via `tryRefresh()`
4. **Logout**: Clears tokens and redirects to `/login`

## Testing

### Run Tests
```bash
# All tests once
npm test

# Watch mode (for development)
npm run test:watch

# With coverage
npm run test:coverage
```

### Test Types

**Unit Tests** — UI components in isolation:
```typescript
// tests/components/ui.test.tsx
it("renders button with text", () => {
  render(<Button>Click</Button>);
  expect(screen.getByText("Click")).toBeInTheDocument();
});
```

**Integration Tests** — Full pages with providers:
```typescript
// tests/pages/login.test.tsx
it("logs in and shows toast", async () => {
  render(<AuthProvider><LoginPage /></AuthProvider>);
  await user.type(screen.getByLabelText("Email"), "admin@test.com");
  await user.click(screen.getByRole("button"));
  expect(screen.getByText("Welcome back!")).toBeInTheDocument();
});
```

**API Mocking** — MSW intercepts HTTP requests:
```typescript
// Tests use mock responses from tests/mocks/handlers.ts
```

### Test Configuration
- **Runner**: Vitest (Vite-based, fast)
- **DOM**: jsdom environment
- **Matchers**: @testing-library/jest-dom
- **Events**: @testing-library/user-event
- **API**: MSW (Mock Service Worker)

## Routing

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Redirects to `/login` | Public |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/forgot-password` | Reset password | Public |
| `/dashboard` | Overview | Protected |
| `/dashboard/products` | Product CRUD | Protected |
| `/dashboard/users` | User list | Protected |

## Design System

### Colors
- Primary: Indigo (`#6366f1`)
- Success: Emerald (`#10b981`)
- Warning: Amber (`#f59e0b`)
- Danger: Red (`#ef4444`)

### Typography
- Font: Geist (Vercel's font)
- Sizes: Tailwind defaults (text-sm, text-base, etc.)

### Spacing
- Uses Tailwind's default spacing scale
- Page padding: `p-6 lg:p-8`
- Component gaps: `gap-4`, `space-y-6`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API base URL |

## Docker

```bash
# Build production image
docker build -t frontend .

# Run container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=https://api.infra-pro.com frontend
```

## Troubleshooting

### API Connection Errors
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS config in Nginx for `api.infra-pro.com`
- Check browser console for CORS errors

### Authentication Issues
- Clear localStorage: `localStorage.clear()` in browser console
- Check token expiry in Application tab
- Verify backend is running: `docker compose ps backend`

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

## License

MIT
