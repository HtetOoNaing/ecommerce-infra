import client, { Registry, Counter, Histogram, Gauge } from "prom-client";

const register = new Registry();

// Collect default Node.js metrics (CPU, memory, event loop, GC, etc.)
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

export const activeConnections = new Gauge({
  name: "http_active_connections",
  help: "Number of active HTTP connections",
  registers: [register],
});

export { register };
