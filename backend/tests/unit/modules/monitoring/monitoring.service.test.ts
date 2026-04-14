import { MonitoringService } from "@/modules/monitoring/monitoring.service";

describe("MonitoringService", () => {
  let service: MonitoringService;

  beforeEach(() => {
    service = new MonitoringService();
  });

  describe("recordMetric", () => {
    it("should store a metric point", () => {
      service.recordMetric("cpu", 42);
      const stats = service.getMetricStats("cpu");
      expect(stats).not.toBeNull();
      expect(stats!.latest).toBe(42);
      expect(stats!.count).toBe(1);
    });

    it("should emit a 'metric' event", (done) => {
      service.on("metric", (data) => {
        expect(data.name).toBe("latency");
        expect(data.value).toBe(15);
        expect(data.timestamp).toBeDefined();
        done();
      });
      service.recordMetric("latency", 15);
    });

    it("should keep max 1000 points per metric", () => {
      for (let i = 0; i < 1010; i++) {
        service.recordMetric("mem", i);
      }
      const stats = service.getMetricStats("mem");
      expect(stats!.count).toBe(1000);
      expect(stats!.min).toBe(10);
      expect(stats!.latest).toBe(1009);
    });
  });

  describe("getMetricStats", () => {
    it("should return null for unknown metric", () => {
      expect(service.getMetricStats("unknown")).toBeNull();
    });

    it("should compute correct min/max/avg", () => {
      service.recordMetric("rps", 10);
      service.recordMetric("rps", 20);
      service.recordMetric("rps", 30);

      const stats = service.getMetricStats("rps")!;
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(30);
      expect(stats.avg).toBe(20);
      expect(stats.latest).toBe(30);
      expect(stats.count).toBe(3);
    });
  });

  describe("checkSystemHealth", () => {
    it("should return system health info", async () => {
      const health = await service.checkSystemHealth();

      expect(health.status).toBe("healthy");
      expect(typeof health.memory.heapUsed).toBe("number");
      expect(typeof health.memory.heapTotal).toBe("number");
      expect(typeof health.memory.rss).toBe("number");
      expect(typeof health.cpu.user).toBe("number");
      expect(typeof health.cpu.system).toBe("number");
      expect(typeof health.uptime).toBe("number");
      expect(typeof health.eventLoopLag).toBe("number");
    });
  });
});
