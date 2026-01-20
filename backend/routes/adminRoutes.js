// routes/adminRoutes.js
import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";

// Admin Auth & Stats
import {
  getAdminStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  forceLogoutUser,
  getAuditLogs,
  getAuditActions,
} from "../controllers/adminController.js";

// Product Controllers
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

// Category Controllers
import {
  bulkCreateCategories,
} from "../controllers/categoryController.js";

// Coupon Controllers
import {
  createCoupon,
  deleteCoupon,
  getAllCoupons,
} from "../controllers/couponController.js";

// Order Controllers
import {
  getAllOrders,
  updateOrderStatus,
  markOrderPaid,
} from "../controllers/orderController.js";

// Review Controllers
import { getAllReviews } from "../controllers/reviewController.js";

const router = express.Router();

// ==========================
// 🔐 Admin Login & Stats
// ==========================

// GET = read-only → CSRF not needed
router.get("/stats", protect, adminOnly, getAdminStats);
// Product Management
// POST/PUT/DELETE = state-changing → CSRF required
router.post("/products", protect, adminOnly, requireCsrf, createProduct);
router.put("/products/:id", protect, adminOnly, requireCsrf, updateProduct);
router.delete("/products/:id", protect, adminOnly, requireCsrf, deleteProduct);

// ==========================
// 🏷 Category Management
// ==========================

router.post(
  "/categories/bulk",
  protect,
  adminOnly,
  requireCsrf,
  bulkCreateCategories
);

// ==========================
// 🎟 Coupon Management
// ==========================

router.post("/coupons", protect, adminOnly, requireCsrf, createCoupon);
router.delete("/coupons/:code", protect, adminOnly, requireCsrf, deleteCoupon);

// ❌ GET read-only
router.get("/coupons", protect, adminOnly, getAllCoupons);


//Order Management

// GET read-only
router.get("/orders", protect, adminOnly, getAllOrders);

// PUT state-changing
router.put(
  "/orders/:id/status",
  protect,
  adminOnly,
  requireCsrf,
  updateOrderStatus
);

router.put(
  "/orders/:id/pay",
  protect,
  adminOnly,
  requireCsrf,
  markOrderPaid
);

// ==========================
// 👥 User Management
// ==========================

// ❌ GET read-only
router.get("/users", protect, adminOnly, getAllUsers);

// ✅ DELETE/PUT state-changing
router.delete("/users/:id", protect, adminOnly, requireCsrf, deleteUser);
router.put("/users/:id", protect, adminOnly, requireCsrf, updateUserRole);
router.post(
  "/users/:id/force-logout",
  protect,
  adminOnly,
  requireCsrf,
  forceLogoutUser
);

// ==========================
// ⭐ Review Management
// ==========================

// ❌ GET read-only
router.get("/reviews", protect, adminOnly, getAllReviews);

// ==========================
// Audit Logs (read-only)

router.get("/audit-logs", protect, adminOnly, getAuditLogs);
router.get("/audit-actions", protect, adminOnly, getAuditActions);

export default router;
