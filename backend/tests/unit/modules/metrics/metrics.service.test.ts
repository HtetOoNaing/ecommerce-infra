import {
  httpRequestDuration,
  httpRequestTotal,
  activeConnections,
  register,
} from "@/modules/metrics/metrics.service";

describe("MetricsService", () => {
  beforeEach(async () => {
    register.resetMetrics();
  });

  it("should export a Prometheus registry", () => {
    expect(register).toBeDefined();
    expect(typeof register.metrics).toBe("function");
  });

  it("should register httpRequestDuration histogram", async () => {
    httpRequestDuration.observe({ method: "GET", route: "/test", status_code: "200" }, 0.05);
    const output = await register.metrics();
    expect(output).toContain("http_request_duration_seconds");
  });

  it("should register httpRequestTotal counter", async () => {
    httpRequestTotal.inc({ method: "GET", route: "/test", status_code: "200" });
    const output = await register.metrics();
    expect(output).toContain("http_requests_total");
  });

  it("should register activeConnections gauge", async () => {
    activeConnections.inc();
    const output = await register.metrics();
    expect(output).toContain("http_active_connections");
    activeConnections.dec();
  });

  it("should collect default Node.js metrics", async () => {
    const output = await register.metrics();
    expect(output).toContain("process_cpu");
  });
});
