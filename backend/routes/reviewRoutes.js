import express from "express";
import {
  addReview,
  getProductReviews,
  deleteReview,
  getAllReviews,
} from "../controllers/reviewController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";

const router = express.Router();

// ============ USER REVIEW ROUTES ============

// ❌ GET = read-only → CSRF not required
router.get("/:productId", getProductReviews);

// ✅ POST = state-changing → CSRF required
router.post("/:productId", protect, requireCsrf, addReview);

// ✅ DELETE = state-changing → CSRF required
router.delete("/:productId/:reviewId", protect, requireCsrf, deleteReview);

// ============ ADMIN ROUTES ============

// ❌ GET = read-only → CSRF not required
router.get("/", protect, adminOnly, getAllReviews);

export default router;
