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

// ─── Client utilities ────────────────────────────────
export {
  ApiError,
  getAccessToken,
  setAccessToken,
  clearAuth,
  request,
} from "./client";
