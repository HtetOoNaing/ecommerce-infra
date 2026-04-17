# Frontend Testing Strategy

Production-grade testing stack covering all layers from unit to E2E.

## Testing Stack

| Type | Tool | Purpose | When to Run |
|------|------|---------|-------------|
| **Unit Tests** | Vitest + RTL | Components, utilities, pure functions | Every PR |
| **Integration Tests** | RTL + MSW | Component + API interaction | Every PR |
| **E2E Tests** | Playwright | Critical user journeys | Staging + Main |
| **Contract Tests** | Zod | API response validation | Every PR |
| **Performance** | Lighthouse CI | Core Web Vitals | PR + Main |
| **Load Testing** | k6 | Concurrent user simulation | Before release |

## Quick Start

```bash
# Install dependencies
npm install

# Run unit + integration tests
npm test

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E with UI mode
npm run test:e2e:ui

# Run Lighthouse CI
npm run test:lighthouse

# Run load tests (requires k6)
npm run test:load:auth
npm run test:load:products

# Run everything
npm run test:all
```

## Test Structure

```
tests/
├── components/          # UI component unit tests
│   └── ui.test.tsx     # Button, Badge, Input, etc.
├── lib/                # Library unit tests
│   ├── auth.test.ts    # Auth API functions
│   ├── users.test.ts   # User API functions
│   ├── products.test.ts # Product API functions
│   ├── client.test.ts  # HTTP client, tokens
│   ├── auth-context.test.tsx # React context
│   └── toast-context.test.tsx # Notifications
├── pages/              # Page integration tests
│   ├── login.test.tsx
│   ├── register.test.tsx
│   ├── forgot-password.test.tsx
│   └── products.test.tsx
├── contracts/          # API contract tests
│   └── api-contracts.test.ts  # Zod validation
├── e2e/                # Playwright E2E tests
│   ├── auth.spec.ts    # Auth flows
│   └── products.spec.ts # Product CRUD
├── load/               # k6 load testing
│   ├── auth-load.js    # Auth endpoint stress
│   └── products-load.js # Product CRUD stress
├── mocks/              # MSW mocks
│   ├── handlers.ts     # API handlers
│   └── server.ts       # MSW server setup
└── setup.ts            # Vitest test setup
```

## Coverage Targets

```json
{
  "global": {
    "branches": 80,
    "functions": 80,
    "lines": 80,
    "statements": 80
  },
  "api/": {
    "branches": 90,
    "functions": 90,
    "lines": 90
  }
}
```

## Test Types Explained

### 1. Unit Tests (Vitest)

Test individual functions/components in isolation.

```typescript
// tests/lib/auth.test.ts
describe("login", () => {
  it("stores tokens and returns user on success", async () => {
    const result = await login("admin@test.com", "Test1234!");
    expect(result.user.email).toBe("admin@test.com");
    expect(getAccessToken()).toBe("mock-access-token");
  });
});
```

**Key Principles:**
- Mock external dependencies (MSW for API)
- Fast execution (< 100ms per test)
- No real network calls
- Clear, focused test cases

### 2. Integration Tests (RTL + MSW)

Test components with their real API logic but mocked backend.

```typescript
// tests/pages/login.test.tsx
describe("LoginPage", () => {
  it("submits login and shows success toast", async () => {
    renderWithProviders(<LoginPage />);
    await user.type(screen.getByLabelText(/email/i), "admin@test.com");
    await user.type(screen.getByLabelText(/password/i), "Test1234!");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/welcome back/i)).toBeInTheDocument();
  });
});
```

**Key Principles:**
- Test from user perspective
- Mock API with MSW (same code path as real API)
- Test DOM interactions
- Verify side effects (toast, navigation)

### 3. Contract Tests (Zod)

Validate API responses match expected schemas.

```typescript
// tests/contracts/api-contracts.test.ts
it("login response matches schema", async () => {
  const response = await login("admin@test.com", "Test1234!");
  const validated = validateResponse(LoginResponseSchema, response);
  expect(validated.user.email).toBe("admin@test.com");
});
```

**Key Principles:**
- Runtime type validation
- Catches API drift early
- Documents API contracts
- Fail fast on breaking changes

### 4. E2E Tests (Playwright)

Test full user journeys in real browsers.

```typescript
// tests/e2e/auth.spec.ts
test("user can login and access dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@test.com");
  await page.getByLabel("Password").fill("Test1234!");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
});
```

**Key Principles:**
- Real browser (Chrome, Firefox, Safari, Mobile)
- Test production-like environment
- Critical paths only (login→dashboard→products→logout)
- Screenshots on failure

### 5. Performance Tests (Lighthouse CI)

Validate Core Web Vitals against budgets.

```javascript
// lighthouserc.js
assertions: {
  "categories:performance": ["error", { minScore: 0.9 }],
  "first-contentful-paint": ["error", { maxNumericValue: 1800 }],
  "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
  "total-blocking-time": ["error", { maxNumericValue: 200 }],
}
```

**Key Principles:**
- Automated CI integration
- Strict budgets for PROD
- Track performance regression
- Test on real URLs

### 6. Load Tests (k6)

Simulate concurrent users.

```javascript
// tests/load/auth-load.js
export const options = {
  stages: [
    { duration: "2m", target: 50 },   // Ramp up
    { duration: "5m", target: 50 },   // Sustained
    { duration: "2m", target: 100 },  // Stress
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};
```

**Key Principles:**
- Gradual ramp-up to find breaking point
- Test production-like load
- Measure latency percentiles
- Verify error rates

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm install -g @lhci/cli
      - run: lhci autorun
```

## Test Utilities

### MSW Handlers

```typescript
// tests/mocks/handlers.ts
export const handlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === "admin@test.com") {
      return HttpResponse.json(mockLoginResponse);
    }
    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }),
];
```

### Test Helpers

```typescript
// tests/setup.ts
export function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ToastProvider>
      <AuthProvider>{ui}</AuthProvider>
    </ToastProvider>
  );
}
```

### Zod Validators

```typescript
// lib/validators.ts
export const LoginResponseSchema = z.object({
  user: AuthUserSchema,
  accessToken: z.string(),
  refreshToken: z.string(),
});

export function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}
```

## Best Practices

1. **Test behaviors, not implementation** — Tests should survive refactoring
2. **Mock at boundaries** — MSW for API, not internal functions
3. **Test pyramid** — 70% unit, 20% integration, 10% E2E
4. **Fail fast in CI** — Unit tests first, E2E in parallel
5. **Production monitoring** — Synthetics catch what tests miss

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MSW not intercepting | Check handler URL matches exactly |
| E2E flaky tests | Add retries, increase timeouts |
| Lighthouse fails | Check budgets, run locally first |
| k6 high memory | Reduce VUs, add sleep between requests |

## Further Reading

- [Vitest Docs](https://vitest.dev/)
- [Playwright Docs](https://playwright.dev/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [k6 Docs](https://k6.io/docs/)
- [Zod Docs](https://zod.dev/)
