import { UserService } from "@/modules/user/user.service";
import { UserRepository } from "@/modules/user/user.repository";
import { UserEntity } from "@/modules/user/user.types";

jest.mock("@/modules/user/user.repository");

const mockUser: UserEntity = {
  id: 1,
  email: "alice@test.com",
  password: "hashed-pw",
  name: "Alice",
  role: "user",
  isVerified: true,
  verificationToken: null,
  resetPasswordToken: null,
  resetPasswordExpires: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("UserService", () => {
  let service: UserService;
  let repoMock: jest.Mocked<UserRepository>;

  beforeEach(() => {
    service = new UserService();
    repoMock = (service as any).repo as jest.Mocked<UserRepository>;
  });

  describe("createUser", () => {
    it("should create user when email is unique", async () => {
      repoMock.findByEmail.mockResolvedValue(null);
      repoMock.create.mockResolvedValue(mockUser);

      const result = await service.createUser({
        email: "alice@test.com",
        password: "pass123",
        role: "user",
        isVerified: false,
      });

      expect(repoMock.findByEmail).toHaveBeenCalledWith("alice@test.com");
      expect(result.id).toBe(1);
      expect(result.email).toBe("alice@test.com");
      // Should NOT return password
      expect((result as any).password).toBeUndefined();
    });

    it("should throw when email already exists", async () => {
      repoMock.findByEmail.mockResolvedValue({ id: 1 } as any);

      await expect(
        service.createUser({
          email: "alice@test.com",
          password: "pass123",
          role: "user",
          isVerified: false,
        })
      ).rejects.toThrow("User already exists");
    });
  });

  describe("getUsers", () => {
    it("should return array of user DTOs", async () => {
      repoMock.findAll.mockResolvedValue({ data: [mockUser], total: 1, page: 1, limit: 10, totalPages: 1 });

      const result = await service.getUsers({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe("alice@test.com");
      expect((result.data[0] as any).password).toBeUndefined();
    });

    it("should return empty array when no users", async () => {
      repoMock.findAll.mockResolvedValue({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 });
      const result = await service.getUsers({ page: 1, limit: 10 });
      expect(result.data).toEqual([]);
    });
  });

  describe("findByEmail", () => {
    it("should delegate to repository", async () => {
      const mockModel = { id: 1, email: "a@b.com" } as any;
      repoMock.findByEmail.mockResolvedValue(mockModel);

      const result = await service.findByEmail("a@b.com");
      expect(result).toBe(mockModel);
      expect(repoMock.findByEmail).toHaveBeenCalledWith("a@b.com");
    });
  });

  describe("findById", () => {
    it("should return user entity when found", async () => {
      repoMock.findById.mockResolvedValue(mockUser);

      const result = await service.findById(1);
      expect(result).toBe(mockUser);
    });

    it("should return null when not found", async () => {
      repoMock.findById.mockResolvedValue(null);

      const result = await service.findById(999);
      expect(result).toBeNull();
    });
  });

  describe("findByVerificationToken", () => {
    it("should delegate to repository", async () => {
      const mockModel = { id: 1 } as any;
      repoMock.findByVerificationToken.mockResolvedValue(mockModel);

      const result = await service.findByVerificationToken("hashed-token");
      expect(result).toBe(mockModel);
    });
  });

  describe("findValidResetToken", () => {
    it("should delegate to repository with token and date", async () => {
      const now = new Date();
      const mockModel = { id: 1 } as any;
      repoMock.findValidResetToken.mockResolvedValue(mockModel);

      const result = await service.findValidResetToken("reset-hash", now);
      expect(result).toBe(mockModel);
      expect(repoMock.findValidResetToken).toHaveBeenCalledWith("reset-hash", now);
    });
  });
});
