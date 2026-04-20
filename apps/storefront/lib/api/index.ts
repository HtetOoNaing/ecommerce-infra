export { apiClient, ApiError } from "./client";
export {
  registerCustomer,
  loginCustomer,
  logoutCustomer,
  clearCustomerAuth,
  getStoredCustomer,
  setStoredCustomer,
} from "./customer-auth";
export { getProducts, getProduct, searchProducts, getProductsByCategory } from "./products";
export { getCategories, getCategory, getCategoryBySlug } from "./categories";
