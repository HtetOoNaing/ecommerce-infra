const mockCreateUser = jest.fn();
const mockGetUsers = jest.fn();

jest.mock("@/modules/user/user.service", () => ({
  UserService: jest.fn().mockImplementation(() => ({
    createUser: mockCreateUser,
    getUsers: mockGetUsers,
  })),
}));

import express from "express";
import request from "supertest";
import { UserController } from "@/modules/user/user.controller";

function createApp() {
  const app = express();
  app.use(express.json());
  const ctrl = new UserController();

  app.post("/users", ctrl.create.bind(ctrl));
  app.get("/users", ctrl.getAll.bind(ctrl));

  app.use((err: any, _req: any, res: any, _next: any) => {
    res.status(err.status || 500).json({ message: err.message });
  });

  return app;
}

const mockUserDto = {
  id: 1, email: "a@b.com", name: "Alice", role: "user" as const, isVerified: true,
};

describe("UserController", () => {
  const app = createApp();

  afterEach(() => jest.clearAllMocks());

  describe("POST /users", () => {
    it("should return 201 on successful creation", async () => {
      mockCreateUser.mockResolvedValue(mockUserDto);

      const res = await request(app)
        .post("/users")
        .send({ email: "a@b.com", password: "pass", role: "user" });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe("a@b.com");
    });

    it("should return 500 when user already exists", async () => {
      mockCreateUser.mockRejectedValue(new Error("User already exists"));

      const res = await request(app)
        .post("/users")
        .send({ email: "dup@b.com", password: "pass", role: "user" });

      expect(res.status).toBe(500);
    });
  });

  describe("GET /users", () => {
    it("should return 200 with users array", async () => {
      mockGetUsers.mockResolvedValue([mockUserDto]);

      const res = await request(app).get("/users");

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].email).toBe("a@b.com");
    });
  });
});
