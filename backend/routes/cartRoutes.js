// routes/cartRoutes.js
import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";

const router = express.Router();

// GET = read-only (no CSRF)
// POST = state-changing (CSRF required)
router
  .route("/")
  .get(protect, getCart)
  .post(protect, requireCsrf, addToCart);

// PUT/DELETE = state-changing (CSRF required)
router.put("/item", protect, requireCsrf, updateCartItem);
router.delete("/item/:itemId", protect, requireCsrf, removeFromCart);
router.delete("/", protect, requireCsrf, clearCart);

export default router;
