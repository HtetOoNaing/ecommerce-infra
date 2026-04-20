const mockAuthenticate = jest.fn().mockResolvedValue(undefined);
const mockPing = jest.fn().mockResolvedValue("PONG");

jest.mock("@/config/db", () => ({
  sequelize: { authenticate: mockAuthenticate },
}));

jest.mock("@/services/redis.service", () => ({
  redisService: { ping: mockPing },
}));

import { HealthService } from "@/modules/health/health.service";

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HealthService();
  });

  it("should return healthy when both DB and Redis are up", async () => {
    const result = await service.checkHealth();

    expect(result.status).toBe("healthy");
    expect(result.services.database).toBe("healthy");
    expect(result.services.redis).toBe("healthy");
    expect(result.timestamp).toBeDefined();
    expect(typeof result.uptime).toBe("number");
  });

  it("should return unhealthy when DB is down", async () => {
    mockAuthenticate.mockRejectedValueOnce(new Error("DB down"));

    const result = await service.checkHealth();

    expect(result.status).toBe("unhealthy");
    expect(result.services.database).toBe("unhealthy");
    expect(result.services.redis).toBe("healthy");
  });

  it("should return unhealthy when Redis is down", async () => {
    mockPing.mockRejectedValueOnce(new Error("Redis down"));

    const result = await service.checkHealth();

    expect(result.status).toBe("unhealthy");
    expect(result.services.database).toBe("healthy");
    expect(result.services.redis).toBe("unhealthy");
  });

  it("should return unhealthy when both are down", async () => {
    mockAuthenticate.mockRejectedValueOnce(new Error("DB down"));
    mockPing.mockRejectedValueOnce(new Error("Redis down"));

    const result = await service.checkHealth();

    expect(result.status).toBe("unhealthy");
    expect(result.services.database).toBe("unhealthy");
    expect(result.services.redis).toBe("unhealthy");
  });
});
