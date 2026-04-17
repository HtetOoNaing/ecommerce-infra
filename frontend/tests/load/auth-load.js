/**
 * k6 Load Test: Authentication Endpoints
 * Simulates concurrent login/logout traffic
 *
 * Run: k6 run tests/load/auth-load.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Rate, Trend } from "k6/metrics";

// Custom metrics
const loginSuccessRate = new Rate("login_success_rate");
const loginDuration = new Trend("login_duration");

// Load test configuration
export const options = {
  // Gradual ramp-up to find breaking point
  stages: [
    { duration: "2m", target: 50 }, // Ramp up to 50 users
    { duration: "5m", target: 50 }, // Stay at 50 users
    { duration: "2m", target: 100 }, // Ramp up to 100 users
    { duration: "5m", target: 100 }, // Stay at 100 users
    { duration: "2m", target: 0 }, // Ramp down
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests < 500ms
    http_req_failed: ["rate<0.01"], // < 1% errors
    login_success_rate: ["rate>0.99"], // > 99% successful logins
  },
};

const BASE_URL = __ENV.BASE_URL || "https://api.infra-pro.com/api/v1";

export default function () {
  // Test login endpoint
  const loginPayload = JSON.stringify({
    email: "admin@test.com",
    password: "Test1234!",
  });

  const loginHeaders = {
    "Content-Type": "application/json",
  };

  const loginStart = Date.now();
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    loginPayload,
    { headers: loginHeaders }
  );
  const loginTime = Date.now() - loginStart;

  // Record metrics
  loginDuration.add(loginTime);
  const loginSuccess = check(loginRes, {
    "login status is 200": (r) => r.status === 200,
    "login has access token": (r) => r.json("accessToken") !== undefined,
  });
  loginSuccessRate.add(loginSuccess);

  if (loginSuccess) {
    const accessToken = loginRes.json("accessToken");

    // Test authenticated endpoint
    const usersRes = http.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    check(usersRes, {
      "users endpoint is accessible": (r) => r.status === 200,
      "users returns array": (r) => Array.isArray(r.json()),
    });

    // Test logout
    const logoutRes = http.post(
      `${BASE_URL}/auth/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    check(logoutRes, {
      "logout successful": (r) => r.status === 200 || r.status === 204,
    });
  }

  sleep(1); // Think time between iterations
}
