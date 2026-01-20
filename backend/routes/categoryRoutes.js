import express from "express";
import {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  bulkCreateCategories,
} from "../controllers/categoryController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public: Get all categories (read-only → no CSRF)
router.get("/", getAllCategories);

// Admin: Create category with image (state-changing → CSRF)
router.post(
  "/",
  protect,
  adminOnly,
  requireCsrf,
  upload.single("image"),
  createCategory
);

// Admin: Update category (state-changing → CSRF)
router.put(
  "/:id",
  protect,
  adminOnly,
  requireCsrf,
  upload.single("image"),
  updateCategory
);

// Admin: Delete category (state-changing → CSRF)
router.delete("/:id", protect, adminOnly, requireCsrf, deleteCategory);

// Admin: Bulk insert categories (state-changing → CSRF)
router.post("/bulk", protect, adminOnly, requireCsrf, bulkCreateCategories);

export default router;
