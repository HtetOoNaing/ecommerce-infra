import { http, HttpResponse } from "msw";

const API = "https://api.infra-pro.com/api/v1";

// ─── Fixture data ───────────────────────────────────
export const mockUser = {
  id: 1,
  email: "admin@test.com",
  name: "Admin",
  role: "admin" as const,
  isVerified: true,
};

export const mockUsers = [
  mockUser,
  { id: 2, email: "user@test.com", name: "User", role: "user" as const, isVerified: false },
];

export const mockProducts = [
  {
    id: 1,
    name: "MacBook Pro",
    description: "16 inch laptop",
    price: 2499.99,
    stock: 50,
    sku: "MBP-16-2026",
    isActive: true,
    createdBy: 1,
    createdAt: "2026-04-11T21:05:44.719Z",
    updatedAt: "2026-04-11T21:05:44.719Z",
  },
  {
    id: 2,
    name: "Magic Keyboard",
    description: "Wireless keyboard",
    price: 99.99,
    stock: 200,
    sku: "MK-2026",
    isActive: false,
    createdBy: 1,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
];

// ─── Handlers ───────────────────────────────────────
export const handlers = [
  // Auth
  http.post(`${API}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === "admin@test.com" && body.password === "Test1234!") {
      return HttpResponse.json({
        user: mockUser,
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
      });
    }
    return HttpResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }),

  http.post(`${API}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string; name?: string };
    return HttpResponse.json({
      user: { ...mockUser, id: 3, email: body.email, name: body.name || null },
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
    });
  }),

  http.post(`${API}/auth/forgot-password`, () => {
    return HttpResponse.json({ message: "Reset link sent" });
  }),

  http.post(`${API}/auth/logout`, () => {
    return HttpResponse.json({ message: "Logged out" });
  }),

  http.post(`${API}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: "mock-refreshed-access-token",
      refreshToken: "mock-refreshed-refresh-token",
    });
  }),

  // Users
  http.get(`${API}/users`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    return HttpResponse.json({
      data: mockUsers,
      total: mockUsers.length,
      page,
      limit,
      totalPages: Math.ceil(mockUsers.length / limit),
    });
  }),

  // Products
  http.get(`${API}/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    return HttpResponse.json({
      data: mockProducts,
      total: mockProducts.length,
      page,
      limit,
      totalPages: Math.ceil(mockProducts.length / limit),
    });
  }),

  http.get(`${API}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === Number(params.id));
    if (!product) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(product);
  }),

  http.post(`${API}/products`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      { id: 3, ...body, isActive: true, createdBy: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      { status: 201 }
    );
  }),

  http.put(`${API}/products/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const product = mockProducts.find((p) => p.id === Number(params.id));
    if (!product) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ ...product, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API}/products/:id`, ({ params }) => {
    const product = mockProducts.find((p) => p.id === Number(params.id));
    if (!product) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),
];
