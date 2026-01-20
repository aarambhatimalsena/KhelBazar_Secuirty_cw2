import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";

const router = express.Router();

// ❌ GET = read-only → CSRF needed छैन
router.get("/", protect, getWishlist);

// ✅ POST / DELETE = state-changing → CSRF required
router.post("/", protect, requireCsrf, addToWishlist);
router.delete("/:productId", protect, requireCsrf, removeFromWishlist);

export default router;
