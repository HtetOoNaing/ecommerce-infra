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

export const mockCategories = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    description: "Electronic devices and accessories",
    isActive: true,
    createdAt: "2026-04-11T21:05:44.719Z",
    updatedAt: "2026-04-11T21:05:44.719Z",
  },
  {
    id: 2,
    name: "Accessories",
    slug: "accessories",
    description: "Computer and device accessories",
    isActive: true,
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
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
    categoryId: 1,
    category: { id: 1, name: "Electronics", slug: "electronics" },
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
    categoryId: 2,
    category: { id: 2, name: "Accessories", slug: "accessories" },
    createdAt: "2026-04-12T10:00:00.000Z",
    updatedAt: "2026-04-12T10:00:00.000Z",
  },
];

export const mockOrders = [
  {
    id: 1,
    userId: 1,
    status: "pending",
    paymentStatus: "pending",
    totalAmount: 2599.98,
    shippingAddress: "123 Main St, City, Country",
    billingAddress: null,
    notes: null,
    items: [
      {
        id: 1,
        productId: 1,
        quantity: 1,
        unitPrice: 2499.99,
        product: { id: 1, name: "MacBook Pro", sku: "MBP-16-2026" },
      },
      {
        id: 2,
        productId: 2,
        quantity: 1,
        unitPrice: 99.99,
        product: { id: 2, name: "Magic Keyboard", sku: "MK-2026" },
      },
    ],
    user: { id: 1, email: "admin@test.com", name: "Admin" },
    createdAt: "2026-04-18T10:00:00.000Z",
    updatedAt: "2026-04-18T10:00:00.000Z",
  },
  {
    id: 2,
    userId: 2,
    status: "delivered",
    paymentStatus: "paid",
    totalAmount: 99.99,
    shippingAddress: "456 Oak Ave, Town, Country",
    billingAddress: "456 Oak Ave, Town, Country",
    notes: "Please leave at the door",
    items: [
      {
        id: 3,
        productId: 2,
        quantity: 1,
        unitPrice: 99.99,
        product: { id: 2, name: "Magic Keyboard", sku: "MK-2026" },
      },
    ],
    user: { id: 2, email: "user@test.com", name: "User" },
    createdAt: "2026-04-17T14:30:00.000Z",
    updatedAt: "2026-04-17T14:30:00.000Z",
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

  // Categories
  http.get(`${API}/categories`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    return HttpResponse.json({
      data: mockCategories,
      total: mockCategories.length,
      page,
      limit,
      totalPages: Math.ceil(mockCategories.length / limit),
    });
  }),

  http.get(`${API}/categories/:id`, ({ params }) => {
    const category = mockCategories.find((c) => c.id === Number(params.id));
    if (!category) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(category);
  }),

  http.get(`${API}/categories/slug/:slug`, ({ params }) => {
    const category = mockCategories.find((c) => c.slug === params.slug);
    if (!category) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(category);
  }),

  http.post(`${API}/categories`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 3,
        ...body,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put(`${API}/categories/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const category = mockCategories.find((c) => c.id === Number(params.id));
    if (!category) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ ...category, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API}/categories/:id`, ({ params }) => {
    const category = mockCategories.find((c) => c.id === Number(params.id));
    if (!category) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),

  // Orders
  http.get(`${API}/orders`, ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);

    return HttpResponse.json({
      data: mockOrders,
      total: mockOrders.length,
      page,
      limit,
      totalPages: Math.ceil(mockOrders.length / limit),
    });
  }),

  http.get(`${API}/orders/:id`, ({ params }) => {
    const order = mockOrders.find((o) => o.id === Number(params.id));
    if (!order) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json(order);
  }),

  http.get(`${API}/orders/user/:userId`, ({ request, params }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10);
    const userOrders = mockOrders.filter((o) => o.userId === Number(params.userId));

    return HttpResponse.json({
      data: userOrders,
      total: userOrders.length,
      page,
      limit,
      totalPages: Math.ceil(userOrders.length / limit),
    });
  }),

  http.post(`${API}/orders`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        id: 3,
        ...body,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: 99.99,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  http.put(`${API}/orders/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const order = mockOrders.find((o) => o.id === Number(params.id));
    if (!order) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return HttpResponse.json({ ...order, ...body, updatedAt: new Date().toISOString() });
  }),

  http.delete(`${API}/orders/:id`, ({ params }) => {
    const order = mockOrders.find((o) => o.id === Number(params.id));
    if (!order) return HttpResponse.json({ message: "Not found" }, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),
];
