import { CustomerService } from "@/modules/customer/customer.service";
import { CustomerRepository } from "@/modules/customer/customer.repository";
import { AppError } from "@/utils/appError";
import { hashPassword, comparePassword } from "@/utils/hash";
import { generateToken, hashToken } from "@/utils/token";
import {
  signCustomerAccessToken,
  signCustomerRefreshToken,
  verifyCustomerRefreshToken,
} from "@/utils/customer-jwt";
import { addEmailJob } from "@/jobs/producers/email.producer";

jest.mock("@/modules/customer/customer.repository");
jest.mock("@/utils/hash");
jest.mock("@/utils/token");
jest.mock("@/utils/customer-jwt");
jest.mock("@/jobs/producers/email.producer");

describe("CustomerService", () => {
  let service: CustomerService;
  let mockRepo: jest.Mocked<CustomerRepository>;

  beforeEach(() => {
    mockRepo = new CustomerRepository() as jest.Mocked<CustomerRepository>;
    (CustomerRepository as jest.Mock).mockImplementation(() => mockRepo);
    service = new CustomerService();
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("creates customer and returns auth response", async () => {
      const customerData = {
        email: "test@example.com",
        password: "Password123",
        name: "Test User",
      };

      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue({
        id: 1,
        ...customerData,
        emailVerified: false,
        shippingAddresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      mockRepo.setVerificationToken.mockResolvedValue({} as any);
      (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
      (generateToken as jest.Mock).mockReturnValue("verification-token");
      (hashToken as jest.Mock).mockReturnValue("hashed-token");
      (signCustomerAccessToken as jest.Mock).mockReturnValue("access-token");
      (signCustomerRefreshToken as jest.Mock).mockReturnValue("refresh-token");

      const result = await service.register(customerData);

      expect(result).toHaveProperty("customer");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(mockRepo.create).toHaveBeenCalledWith({
        ...customerData,
        password: "hashedPassword",
      });
    });

    it("throws conflict when email exists", async () => {
      mockRepo.findByEmail.mockResolvedValue({ id: 1 } as any);

      await expect(
        service.register({
          email: "existing@example.com",
          password: "Password123",
        })
      ).rejects.toThrow(AppError);
    });
  });

  describe("login", () => {
    it("returns auth response for valid credentials", async () => {
      const customer = {
        id: 1,
        email: "test@example.com",
        password: "hashedPassword",
        emailVerified: true,
        name: "Test User",
        shippingAddresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.findByEmail.mockResolvedValue(customer as any);
      (comparePassword as jest.Mock).mockResolvedValue(true);
      (signCustomerAccessToken as jest.Mock).mockReturnValue("access-token");
      (signCustomerRefreshToken as jest.Mock).mockReturnValue("refresh-token");

      const result = await service.login("test@example.com", "Password123");

      expect(result.customer.email).toBe("test@example.com");
      expect(result.accessToken).toBe("access-token");
    });

    it("throws unauthorized for invalid email", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(service.login("test@example.com", "password")).rejects.toThrow(
        AppError
      );
    });

    it("throws unauthorized for unverified email", async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: 1,
        emailVerified: false,
      } as any);

      await expect(service.login("test@example.com", "password")).rejects.toThrow(
        AppError
      );
    });

    it("throws unauthorized for invalid password", async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: 1,
        emailVerified: true,
        password: "hashedPassword",
      } as any);
      (comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(service.login("test@example.com", "wrongpassword")).rejects.toThrow(
        AppError
      );
    });
  });

  describe("forgotPassword", () => {
    it("sends reset email for existing customer", async () => {
      mockRepo.findByEmail.mockResolvedValue({
        id: 1,
        email: "test@example.com",
      } as any);
      mockRepo.setResetToken.mockResolvedValue({} as any);
      (generateToken as jest.Mock).mockReturnValue("reset-token");
      (hashToken as jest.Mock).mockReturnValue("hashed-token");

      await service.forgotPassword("test@example.com");

      expect(mockRepo.setResetToken).toHaveBeenCalled();
    });

    it("does not throw for non-existing email", async () => {
      mockRepo.findByEmail.mockResolvedValue(null);

      await expect(
        service.forgotPassword("nonexistent@example.com")
      ).resolves.not.toThrow();
    });
  });

  describe("getProfile", () => {
    it("returns customer profile", async () => {
      const customer = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        phone: "1234567890",
        emailVerified: true,
        shippingAddresses: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepo.findById.mockResolvedValue(customer as any);

      const result = await service.getProfile(1);

      expect(result.email).toBe("test@example.com");
      // password is stripped from DTO via toJSON()
    });

    it("throws not found for invalid id", async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getProfile(999)).rejects.toThrow(AppError);
    });
  });

  describe("addAddress", () => {
    it("adds address to customer", async () => {
      const customer = {
        id: 1,
        shippingAddresses: [],
      };

      mockRepo.findById.mockResolvedValue(customer as any);
      mockRepo.updateShippingAddresses.mockResolvedValue({ ...customer } as any);

      const address = {
        name: "Home",
        address: "123 Main St",
        city: "New York",
        state: "NY",
        zip: "10001",
        country: "USA",
      };

      const result = await service.addAddress(1, address);

      expect(result).toHaveProperty("id");
      expect(result.address).toBe("123 Main St");
    });
  });
});
