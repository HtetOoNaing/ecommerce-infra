/**
 * k6 Load Test: Products CRUD Operations
 * Simulates admin product management under load
 *
 * Run: k6 run tests/load/products-load.js
 */
import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

// Custom metrics
const productsFetched = new Counter("products_fetched");
const productCreateSuccess = new Rate("product_create_success");
const productUpdateSuccess = new Rate("product_update_success");
const apiResponseTime = new Trend("api_response_time");

// Stress test configuration
export const options = {
  scenarios: {
    // Read-heavy: Most users just browse
    browse: {
      executor: "constant-vus",
      vus: 50,
      duration: "10m",
      exec: "browseProducts",
    },
    // Write-heavy: Few admins managing products
    manage: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "2m", target: 10 },
        { duration: "8m", target: 10 },
        { duration: "2m", target: 0 },
      ],
      exec: "manageProducts",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
    product_create_success: ["rate>0.95"],
    product_update_success: ["rate>0.95"],
  },
};

const BASE_URL = __ENV.BASE_URL || "https://api.infra-pro.com/api/v1";

// Helper: Get auth token
function getAuthToken() {
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({
      email: "admin@test.com",
      password: "Test1234!",
    }),
    { headers: { "Content-Type": "application/json" } }
  );

  const success = check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  return success ? loginRes.json("accessToken") : null;
}

// Scenario 1: Browse products (read-only)
export function browseProducts() {
  group("Browse Products", () => {
    const start = Date.now();
    const res = http.get(`${BASE_URL}/products`);
    apiResponseTime.add(Date.now() - start);

    const success = check(res, {
      "products list returns 200": (r) => r.status === 200,
      "products is array": (r) => Array.isArray(r.json()),
    });

    if (success) {
      productsFetched.add(res.json().length);
    }
  });

  sleep(Math.random() * 2 + 1); // 1-3s think time
}

// Scenario 2: Manage products (CRUD)
export function manageProducts() {
  const token = getAuthToken();
  if (!token) {
    return;
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  group("Create Product", () => {
    const createPayload = JSON.stringify({
      name: `Load Test Product ${Date.now()}`,
      sku: `LOAD-${Math.random().toString(36).substring(7)}`,
      price: 99.99,
      stock: 100,
      isActive: true,
    });

    const start = Date.now();
    const createRes = http.post(`${BASE_URL}/products`, createPayload, {
      headers,
    });
    apiResponseTime.add(Date.now() - start);

    const created = check(createRes, {
      "product created": (r) => r.status === 201 || r.status === 200,
      "product has id": (r) => r.json("id") !== undefined,
    });

    productCreateSuccess.add(created);

    if (created) {
      const productId = createRes.json("id");

      // Update the product
      group("Update Product", () => {
        const updatePayload = JSON.stringify({
          name: "Updated Load Test Product",
          price: 149.99,
        });

        const updateStart = Date.now();
        const updateRes = http.put(
          `${BASE_URL}/products/${productId}`,
          updatePayload,
          { headers }
        );
        apiResponseTime.add(Date.now() - updateStart);

        const updated = check(updateRes, {
          "product updated": (r) => r.status === 200,
          "price updated": (r) => r.json("price") === 149.99,
        });

        productUpdateSuccess.add(updated);

        // Clean up - delete product
        const deleteRes = http.del(`${BASE_URL}/products/${productId}`, null, {
          headers,
        });
        check(deleteRes, {
          "product deleted": (r) => r.status === 200 || r.status === 204,
        });
      });
    }
  });

  sleep(2);
}
