import express from "express";
import rateLimit from "express-rate-limit";

import {
  placeOrder,
  downloadInvoice,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  markOrderPaid,
  getOrderByIdForUser,
  getOrderByIdAdmin,
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";
import { validateOrder } from "../middleware/validators/orderValidator.js";

const router = express.Router();

// ====== limiter ======
const orderPlacementLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many order attempts. Please try again later." },
});

// ============ USER ROUTES ============

// ❌ GET = read-only → CSRF not needed
// ✅ POST = state-changing → CSRF required
router.post(
  "/place",
  protect,
  requireCsrf,
  orderPlacementLimiter,
  validateOrder,
  placeOrder
);

router.get("/invoice/:orderId", protect, downloadInvoice);

router.get("/my-orders", protect, getUserOrders);

// ✅ IDOR-safe endpoint (returns 404 if not owner)
router.get("/my-orders/:id", protect, getOrderByIdForUser);

// ============ ADMIN ROUTES ============

// ❌ GET = read-only → CSRF not needed
router.get("/admin/all", protect, adminOnly, getAllOrders);
router.get("/admin/:id", protect, adminOnly, getOrderByIdAdmin);

// ✅ PUT = state-changing → CSRF required
router.put("/admin/status", protect, adminOnly, requireCsrf, updateOrderStatus);

router.put("/admin/mark-paid", protect, adminOnly, requireCsrf, markOrderPaid);

export default router;
