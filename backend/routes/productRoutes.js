// backend/routes/productRoutes.js
import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getRecommendedProducts,
} from '../controllers/productController.js';

import { protect, adminOnly } from '../middleware/authMiddleware.js';
import upload, { validateImageSignature } from "../middleware/upload.js";

// ⭐ NEW: review controller import
import {
  addReview,
  getProductReviews,
} from "../controllers/reviewController.js";

const router = express.Router();

// Public routes
router.get('/', getAllProducts);
router.get('/category/:categoryName', getProductsByCategory);

// ⭐ Related products route (must be above /:id) 
router.get('/:id/recommendations', getRecommendedProducts);

// ⭐⭐ NEW: REVIEW ROUTES – keep these ABOVE '/:id'
router.post('/:productId/reviews', protect, addReview);
router.get('/:productId/reviews', getProductReviews);

// Single product
router.get('/:id', getProductById);

// Admin-only routes
router.post(
  '/admin',
  protect,
  adminOnly,
  upload.single('image'),
  validateImageSignature,
  createProduct
);

router.put(
  '/admin/:id',
  protect,
  adminOnly,
  upload.single('image'),
  validateImageSignature,
  updateProduct
);

router.delete('/admin/:id', protect, adminOnly, deleteProduct);

export default router;
