// controllers/reviewController.js
import Product from "../models/Product.js";
import Notification from "../models/Notification.js"; // 👈 DIRECT IMPORT
import { writeAuditLog } from "../utils/audit.js";
import { sanitizeText } from "../utils/sanitize.js";

// ✅ Add a Review
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.productId;
  const userId = req.user._id;
  const { value: cleanComment, modified: commentModified } = sanitizeText(
    comment,
    1000
  );

  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this product" });
    }

    if (!cleanComment) {
      return res.status(400).json({ message: "Invalid review comment" });
    }

    if (commentModified) {
      await writeAuditLog({
        user: userId,
        action: "XSS_BLOCKED",
        req,
        metadata: { field: "comment", route: "add_review", productId },
      });
    }

    const review = {
      user: userId,
      name: req.user.name,
      rating: Number(rating),
      comment: cleanComment,
    };

    // push review + recalc stats
    product.reviews.push(review);
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.numReviews;

    await product.save();

    // last saved review (with _id)
    const savedReview = product.reviews[product.reviews.length - 1];

    // 🔔 CREATE NOTIFICATION DIRECTLY
    await Notification.create({
      user: userId,
      message: `Thanks for reviewing ${product.name}! ⭐`,
      type: "review",
      link: `/product/${productId}?focus=reviews&reviewId=${savedReview?._id}`,
      product: productId,
    });

    res.status(201).json({ message: "✅ Review added" });
  } catch (err) {
    console.error("addReview error:", err);
    res.status(500).json({
      message: "❌ Server error",
      error: err.message,
    });
  }
};

// ✅ Get All Reviews for a Product
export const getProductReviews = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.status(200).json(product.reviews);
  } catch (err) {
    res.status(500).json({
      message: "❌ Server error",
      error: err.message,
    });
  }
};

// ✅ Delete a Review (user or admin)
export const deleteReview = async (req, res) => {
  const { productId, reviewId } = req.params;
  const userId = req.user._id;

  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.find((r) => r._id.toString() === reviewId);
    if (!review)
      return res.status(404).json({ message: "Review not found" });

    // Permission: owner or admin
    if (
      review.user.toString() !== userId.toString() &&
      !(req.user.role === "admin" || req.user.isAdmin)
    ) {
      await writeAuditLog({
        user: req.user?._id || req.user?.id || null,
        action: "IDOR_ATTEMPT",
        req,
        metadata: {
          resource: "review",
          productId,
          reviewId,
          ownerId: review.user,
        },
      });

      return res.status(404).json({ message: "Review not found" });
    }

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );
    product.numReviews = product.reviews.length;
    product.rating = product.reviews.length
      ? product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length
      : 0;

    await product.save();

    // 🔔 notification on delete
    await Notification.create({
      user: userId,
      message: `Your review on ${product.name} was deleted.`,
      type: "review",
      link: `/product/${productId}?focus=reviews`,
      product: productId,
    });

    res.json({ message: "✅ Review deleted successfully" });
  } catch (err) {
    console.error("deleteReview error:", err);
    res.status(500).json({
      message: "❌ Server error",
      error: err.message,
    });
  }
};

// ✅ Admin: Get All Reviews Across All Products
export const getAllReviews = async (req, res) => {
  try {
    const products = await Product.find({}, "name reviews");

    const allReviews = products.flatMap((product) =>
      product.reviews.map((review) => ({
        _id: review._id,
        productId: product._id,
        productName: product.name,
        user: review.user,
        name: review.name,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
      }))
    );

    res.json(allReviews);
  } catch (err) {
    console.error("getAllReviews error:", err);
    res.status(500).json({
      message: "❌ Failed to load reviews",
      error: err.message,
    });
  }
};
