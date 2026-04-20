// ─── Auth ────────────────────────────────────────────
export type {
  UserRole,
  AuthUser,
  AuthTokens,
  LoginResponse,
  RegisterResponse,
} from "./auth";

// ─── User ────────────────────────────────────────────
export type { User } from "./user";

// ─── Category ─────────────────────────────────────────
export type {
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "./category";

// ─── Product ───────────────────────────────────────────
export type {
  CategoryInfo,
  Product,
  CreateProductDto,
  UpdateProductDto,
} from "./product";

// ─── Pagination ────────────────────────────────────────
export type { PaginatedResponse } from "./pagination";

// ─── Order ─────────────────────────────────────────────
export type {
  OrderStatus,
  PaymentStatus,
  OrderItem,
  Order,
  CreateOrderDto,
  UpdateOrderDto,
} from "./order";

// ─── Customer ───────────────────────────────────────────
export type {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerLoginDto,
  CustomerAuthResponse,
  AddAddressDto,
} from "./customer";
