import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_ACCESS_SECRET!;

// Recreate minimal auth middleware for isolated testing
const authenticate = (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Recreate minimal validate middleware for isolated testing
const validate = (schema: any) => (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body);
    next();
  } catch (err: any) {
    res.status(400).json({ message: "Validation error", errors: err.errors });
  }
};

function createTestApp() {
  const app = express();
  app.use(express.json());

  app.get("/public", (_req, res) => res.json({ data: "public" }));
  app.get("/protected", authenticate, (req: any, res) => {
    res.json({ user: req.user });
  });

  return app;
}

function generateToken(payload: object, expiresIn: string = "15m") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

describe("Auth Middleware", () => {
  const app = createTestApp();

  it("should allow public routes without token", async () => {
    const res = await request(app).get("/public");
    expect(res.status).toBe(200);
    expect(res.body.data).toBe("public");
  });

  it("should reject protected routes without token", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should reject invalid token", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer invalid-token");

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  it("should accept valid token and attach user", async () => {
    const token = generateToken({
      id: 1,
      email: "test@test.com",
      role: "admin",
      sessionId: "test-session",
    });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe(1);
    expect(res.body.user.email).toBe("test@test.com");
    expect(res.body.user.role).toBe("admin");
  });

  it("should reject expired token", async () => {
    const token = generateToken(
      { id: 1, email: "test@test.com", role: "user", sessionId: "s1" },
      "0s"
    );

    // Wait for token to expire
    await new Promise((r) => setTimeout(r, 100));

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it("should reject malformed Authorization header", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Token abc123");

    expect(res.status).toBe(401);
  });
});
