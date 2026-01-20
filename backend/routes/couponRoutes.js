import express from 'express';
import { createCoupon, getCoupon, deleteCoupon, getAllCoupons } from '../controllers/couponController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Only admins can create/delete/list all coupons, but anyone can validate a coupon by code
router.post('/', protect, adminOnly, createCoupon);
router.get('/:code', getCoupon);
router.delete('/:code', protect, adminOnly, deleteCoupon);
router.get('/', protect, adminOnly, getAllCoupons); 

export default router;
