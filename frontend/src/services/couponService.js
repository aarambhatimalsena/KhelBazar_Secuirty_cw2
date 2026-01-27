// src/services/couponService.js
import api from "../api/api";

// ---------------------------
// ADMIN SIDE
// ---------------------------

// Get all coupons (admin)
export const getAllCoupons = async () => {
  const res = await api.get("/admin/coupons");
  return res.data;
};

// Create a new coupon (admin)
export const createCoupon = async (couponData) => {
  const res = await api.post("/admin/coupons", couponData);
  return res.data;
};

// Delete coupon by code (admin)
export const deleteCoupon = async (code) => {
  const res = await api.delete(`/admin/coupons/${code}`);
  return res.data;
};

// ---------------------------
// USER SIDE – APPLY COUPON
// ---------------------------

// Validate & apply coupon from checkout page
export const applyCoupon = async (code, subtotal) => {
  // GET /coupons/:code   (your backend getCoupon)
  const res = await api.get(`/coupons/${encodeURIComponent(code)}`);
  const coupon = res.data;

  const percentage = coupon.discountPercentage || 0;
  const baseSub = subtotal || 0;

  const rawDiscount = (baseSub * percentage) / 100;
  const discountAmount = Math.round(rawDiscount);

  const newTotal = Math.max(baseSub - discountAmount, 0);

  return {
    coupon,          // full coupon
    discountAmount,  // Rs. discount
    newTotal,        // final amount after discount
  };
};
