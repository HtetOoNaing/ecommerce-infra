// ─── Auth API ────────────────────────────────────────
export {
  login,
  register,
  forgotPassword,
  resetPassword,
  logout,
} from "./auth";

// ─── Users API ───────────────────────────────────────
export { getUsers } from "./users";

// ─── Products API ────────────────────────────────────
export {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./products";

// ─── Categories API ──────────────────────────────────
export {
  getCategories,
  getCategory,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./categories";

// ─── Orders API ────────────────────────────────────
export {
  getOrders,
  getOrder,
  getOrdersByUser,
  createOrder,
  updateOrder,
  deleteOrder,
} from "./orders";

// ─── Client utilities ────────────────────────────────
export {
  ApiError,
  getAccessToken,
  setAccessToken,
  clearAuth,
  request,
} from "./client";
