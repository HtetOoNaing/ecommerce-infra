import { corsOptions } from "@/middlewares/cors.middleware";

describe("CORS middleware config", () => {
  const originFn = corsOptions.origin as (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => void;

  it("should allow requests with no origin (server-to-server)", (done) => {
    originFn(undefined, (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it("should allow https://infra-pro.com", (done) => {
    originFn("https://infra-pro.com", (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it("should allow https://app.infra-pro.com", (done) => {
    originFn("https://app.infra-pro.com", (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it("should allow http://localhost:3000", (done) => {
    originFn("http://localhost:3000", (err, allow) => {
      expect(err).toBeNull();
      expect(allow).toBe(true);
      done();
    });
  });

  it("should reject unknown origins", (done) => {
    originFn("https://evil.com", (err) => {
      expect(err).toBeInstanceOf(Error);
      expect(err!.message).toBe("Not allowed by CORS");
      done();
    });
  });

  it("should have credentials enabled", () => {
    expect(corsOptions.credentials).toBe(true);
  });

  it("should set maxAge to 24 hours", () => {
    expect(corsOptions.maxAge).toBe(86400);
  });
});
