// src/services/reviewService.js
import api from "../api/api";

/**
 * ⭐ Create review
 * Route: POST /api/reviews/:productId
 * Body: { rating, comment }
 */
export const createReview = async (productId, data) => {
  const res = await api.post(`/reviews/${productId}`, data);
  return res.data;
};

/**
 * ⭐ Get reviews for a product
 * Route: GET /api/reviews/:productId
 */
export const getProductReviews = async (productId) => {
  const res = await api.get(`/reviews/${productId}`);
  return res.data;
};

/**
 * ⭐ Admin: Get all reviews across all products
 * Route: GET /api/reviews
 * (protected + adminOnly)
 */
export const getAllReviews = async () => {
  const res = await api.get(`/reviews`);
  return res.data;
};

/**
 * ⭐ Delete review (User OR Admin)
 * Backend route:
 * DELETE /api/reviews/:productId/:reviewId
 *
 * Backend permission rules:
 * - Review owner can delete
 * - Admin can delete
 */
export const deleteReview = async (productId, reviewId) => {
  const res = await api.delete(`/reviews/${productId}/${reviewId}`);
  return res.data;
};

/**
 * ⭐ Admin helper: delete review using payload object
 * Used by ReviewTable.jsx:
 *   deleteReviewByAdmin({ productId, reviewId })
 */
export const deleteReviewByAdmin = async ({ productId, reviewId }) => {
  // internally same route use gareko
  const res = await api.delete(`/reviews/${productId}/${reviewId}`);
  return res.data;
};
