import express from "express";
import {
  getAllBrands,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// Public (read-only → no CSRF)
router.get("/", getAllBrands);
router.get("/:id", getBrandById);

// Admin (state-changing → CSRF)
router.post(
  "/",
  protect,
  adminOnly,
  requireCsrf,
  upload.single("logo"),
  createBrand
);

router.put(
  "/:id",
  protect,
  adminOnly,
  requireCsrf,
  upload.single("logo"),
  updateBrand
);

router.delete("/:id", protect, adminOnly, requireCsrf, deleteBrand);

export default router;
