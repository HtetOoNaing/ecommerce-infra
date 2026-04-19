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

// ─── Client utilities ────────────────────────────────
export {
  ApiError,
  getAccessToken,
  setAccessToken,
  clearAuth,
  request,
} from "./client";
