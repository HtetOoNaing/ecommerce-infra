import { ProductService } from "@/modules/product/product.service";
import { ProductRepository } from "@/modules/product/product.repository";
import { AppError } from "@/utils/appError";
import { ProductEntity } from "@/modules/product/product.types";

// Mock the repository — isolate the service layer
jest.mock("@/modules/product/product.repository");

const mockProduct: ProductEntity = {
  id: 1,
  name: "Widget",
  description: "A fine widget",
  price: 29.99,
  stock: 100,
  sku: "WDG-001",
  isActive: true,
  createdBy: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("ProductService", () => {
  let service: ProductService;
  let repoMock: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    service = new ProductService();
    // Access the mocked instance created inside the service constructor
    repoMock = (service as any).repo as jest.Mocked<ProductRepository>;
  });

  describe("create", () => {
    it("should create a product when SKU is unique", async () => {
      repoMock.findBySku.mockResolvedValue(null);
      repoMock.create.mockResolvedValue(mockProduct);

      const result = await service.create({
        name: "Widget",
        description: "A fine widget",
        price: 29.99,
        stock: 100,
        sku: "WDG-001",
        createdBy: 1,
      });

      expect(repoMock.findBySku).toHaveBeenCalledWith("WDG-001");
      expect(repoMock.create).toHaveBeenCalled();
      expect(result.id).toBe(1);
      expect(result.name).toBe("Widget");
    });

    it("should throw conflict (409) when SKU already exists", async () => {
      repoMock.findBySku.mockResolvedValue(mockProduct);

      await expect(
        service.create({
          name: "Dup",
          price: 10,
          stock: 5,
          sku: "WDG-001",
          createdBy: 1,
        })
      ).rejects.toThrow(AppError);

      try {
        await service.create({
          name: "Dup",
          price: 10,
          stock: 5,
          sku: "WDG-001",
          createdBy: 1,
        });
      } catch (err: any) {
        expect(err.status).toBe(409);
      }
    });
  });

  describe("getAll", () => {
    it("should return all products as DTOs", async () => {
      repoMock.findAll.mockResolvedValue([mockProduct]);

      const result = await service.getAll();

      expect(result).toHaveLength(1);
      expect(result[0].sku).toBe("WDG-001");
    });

    it("should return empty array when no products", async () => {
      repoMock.findAll.mockResolvedValue([]);

      const result = await service.getAll();
      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should return product DTO when found", async () => {
      repoMock.findById.mockResolvedValue(mockProduct);

      const result = await service.getById(1);
      expect(result.id).toBe(1);
    });

    it("should throw 404 when not found", async () => {
      repoMock.findById.mockResolvedValue(null);

      await expect(service.getById(999)).rejects.toThrow(AppError);

      try {
        await service.getById(999);
      } catch (err: any) {
        expect(err.status).toBe(404);
      }
    });
  });

  describe("update", () => {
    it("should update and return product DTO", async () => {
      const updated = { ...mockProduct, name: "Updated Widget" };
      repoMock.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: "Updated Widget" });
      expect(result.name).toBe("Updated Widget");
    });

    it("should throw 404 when product to update not found", async () => {
      repoMock.update.mockResolvedValue(null);

      await expect(service.update(999, { name: "x" })).rejects.toThrow(AppError);
    });

    it("should throw 409 when updating SKU to an existing one", async () => {
      const otherProduct = { ...mockProduct, id: 2, sku: "TAKEN-SKU" };
      repoMock.findBySku.mockResolvedValue(otherProduct);

      await expect(
        service.update(1, { sku: "TAKEN-SKU" })
      ).rejects.toThrow(AppError);

      try {
        await service.update(1, { sku: "TAKEN-SKU" });
      } catch (err: any) {
        expect(err.status).toBe(409);
      }
    });

    it("should allow updating SKU to its own SKU", async () => {
      repoMock.findBySku.mockResolvedValue(mockProduct); // same id=1
      repoMock.update.mockResolvedValue(mockProduct);

      const result = await service.update(1, { sku: "WDG-001" });
      expect(result.sku).toBe("WDG-001");
    });
  });

  describe("delete", () => {
    it("should delete existing product", async () => {
      repoMock.delete.mockResolvedValue(true);

      await expect(service.delete(1)).resolves.toBeUndefined();
    });

    it("should throw 404 when product to delete not found", async () => {
      repoMock.delete.mockResolvedValue(false);

      await expect(service.delete(999)).rejects.toThrow(AppError);
    });
  });
});
