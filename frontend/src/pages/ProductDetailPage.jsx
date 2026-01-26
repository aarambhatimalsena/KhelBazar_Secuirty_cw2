// src/pages/ProductDetailPage.jsx 
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import {
  getProductById,
  createReview,
  getRecommendedProducts,
} from "../services/productService";
import { deleteReview } from "../services/reviewService";
import { FaHeart, FaStar } from "react-icons/fa";
import { FiHome } from "react-icons/fi";
import { useAuth } from "../auth/AuthProvider";
import toast from "react-hot-toast";
import {
  getWishlistItems,
  addToWishlist,
  removeFromWishlist,
} from "../services/wishlistService";
import {
  addToCart,
  getCart,
  removeFromCart,
} from "../services/cartService";
import BannerImg from "../assets/image.png";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const instantProduct = location.state?.product || null;

  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(instantProduct);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!instantProduct);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // UI states
  const [activeTab, setActiveTab] = useState("description");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(null);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Wishlist IDs (main + related)
  const [wishlistIds, setWishlistIds] = useState([]);

  // Which review is being deleted
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // CART STATUS for this product
  const [cartItemId, setCartItemId] = useState(null);

  // REVIEW SECTION REF (fallback scroll)
  const reviewsRef = useRef(null);

  // ---------- HELPERS ----------
  const getAvailableStock = () => {
    if (!product) return 0;

    if (product.variants?.length && selectedVariantIndex !== null) {
      const variant = product.variants[selectedVariantIndex];
      if (variant && typeof variant.stock === "number") {
        return variant.stock;
      }
    }

    return typeof product.stock === "number" ? product.stock : 0;
  };

  const renderStars = (value) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          className={
            s <= value ? "text-red-500 text-xs" : "text-gray-300 text-xs"
          }
        />
      ))}
    </div>
  );

  // ---------- CART STATUS FOR THIS PRODUCT ----------
  const updateCartStatusForProduct = async (productId) => {
    if (!isAuthenticated) {
      setCartItemId(null);
      return;
    }
    try {
      const cart = await getCart(); // { user, items: [...] }
      const item =
        cart.items?.find(
          (i) => i.product && i.product._id === productId
        ) || null;
      setCartItemId(item ? item._id : null);
    } catch (err) {
      console.error("Failed to check cart status", err);
      setCartItemId(null);
    }
  };

  // ---------- WISHLIST (MAIN) ----------
  const checkWishlistStatus = async () => {
    if (!isAuthenticated) {
      setIsWishlisted(false);
      setWishlistIds([]);
      return;
    }
    try {
      const items = await getWishlistItems();
      const ids = items.map((item) =>
        item.product ? item.product._id : item._id
      );
      setWishlistIds(ids);
      setIsWishlisted(ids.includes(id));
    } catch {
      setIsWishlisted(false);
      setWishlistIds([]);
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast("🚫 Please log in to manage your wishlist.", {
        icon: "❌",
        style: {
          border: "1px solid #f87171",
          padding: "12px",
          color: "#991b1b",
          background: "#fee2e2",
        },
      });
      navigate("/login");
      return;
    }

    try {
      if (isWishlisted) {
        await removeFromWishlist(id);
        toast("❌ Removed from wishlist");
        setWishlistIds((prev) => prev.filter((pid) => pid !== id));
      } else {
        await addToWishlist([id]);
        toast.success("✅ Added to wishlist");
        setWishlistIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
      }
      setIsWishlisted(!isWishlisted);
      window.dispatchEvent(new Event("update-wishlist-count"));
    } catch {
      toast.error("❌ Wishlist update failed");
    }
  };

  // ---------- WISHLIST (RELATED) ----------
  const handleRelatedWishlistToggle = async (productId) => {
    if (!isAuthenticated) {
      toast("🚫 Please log in to manage your wishlist.", {
        icon: "❌",
        style: {
          border: "1px solid #f87171",
          padding: "12px",
          color: "#991b1b",
          background: "#fee2e2",
        },
      });
      navigate("/login");
      return;
    }

    const already = wishlistIds.includes(productId);

    try {
      if (already) {
        await removeFromWishlist(productId);
        toast("❌ Removed from wishlist");
        setWishlistIds((prev) => prev.filter((pid) => pid !== productId));
      } else {
        await addToWishlist([productId]);
        toast.success("✅ Added to wishlist");
        setWishlistIds((prev) =>
          prev.includes(productId) ? prev : [...prev, productId]
        );
      }
      window.dispatchEvent(new Event("update-wishlist-count"));
    } catch {
      toast.error("❌ Wishlist update failed");
    }
  };

  // ---------- CART ----------
  const handleDecreaseQty = () => {
    setQuantity((q) => (q > 1 ? q - 1 : 1));
  };

  const handleIncreaseQty = () => {
    const availableStock = getAvailableStock();
    setQuantity((q) => {
      if (availableStock <= 0) return q;
      if (q >= availableStock) return q;
      return q + 1;
    });
  };

  const validateCartAction = () => {
    if (!isAuthenticated) {
      toast("🚫 Please log in to add to cart", {
        icon: "❌",
        style: {
          border: "1px solid #f87171",
          padding: "12px",
          color: "#991b1b",
          background: "#fee2e2",
        },
      });
      navigate("/login");
      return false;
    }

    if (product.variants?.length && selectedVariantIndex === null) {
      toast.error("Please select a size before continuing.");
      return false;
    }

    const availableStock = getAvailableStock();
    if (availableStock > 0 && quantity > availableStock) {
      toast.error("Quantity exceeds available stock.");
      return false;
    }

    return true;
  };

  const handleAddToCart = async () => {
    if (!validateCartAction()) return;

    try {
      await addToCart(product._id, quantity);
      toast.success("✅ Cart updated");
      window.dispatchEvent(new Event("update-cart-count"));

      setProduct((prev) => {
        if (!prev) return prev;
        const currentStock = prev.stock || 0;
        const newStock = Math.max(currentStock - quantity, 0);
        return { ...prev, stock: newStock };
      });
      setQuantity(1);

      await updateCartStatusForProduct(product._id);
    } catch {
      toast.error("❌ Failed to add to cart");
    }
  };

  const handleRemoveFromCart = async () => {
    if (!isAuthenticated) {
      toast("🚫 Please log in to manage cart", {
        icon: "❌",
        style: {
          border: "1px solid #f87171",
          padding: "12px",
          color: "#991b1b",
          background: "#fee2e2",
        },
      });
      navigate("/login");
      return;
    }
    if (!cartItemId) return;

    try {
      await removeFromCart(cartItemId);
      toast("❌ Removed from cart", {
        icon: "🗑️",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
      setCartItemId(null);
      window.dispatchEvent(new Event("update-cart-count"));
    } catch {
      toast.error("❌ Failed to remove from cart");
    }
  };

  const handleBuyNow = async () => {
    if (!validateCartAction()) return;

    try {
      await addToCart(product._id, quantity);
      window.dispatchEvent(new Event("update-cart-count"));

      setProduct((prev) => {
        if (!prev) return prev;
        const currentStock = prev.stock || 0;
        const newStock = Math.max(currentStock - quantity, 0);
        return { ...prev, stock: newStock };
      });
      setQuantity(1);

      toast.success("✅ Redirecting to checkout");
      navigate("/checkout");
    } catch {
      toast.error("❌ Failed to process Buy Now");
    }
  };

  const handleAddRelatedToCart = async (relatedProductId) => {
    if (!isAuthenticated) {
      toast("🚫 Please log in to add to cart", {
        icon: "❌",
        style: {
          border: "1px solid #f87171",
          padding: "12px",
          color: "#991b1b",
          background: "#fee2e2",
        },
      });
      navigate("/login");
      return;
    }

    try {
      await addToCart(relatedProductId, 1);
      toast.success("✅ Added to cart");
      window.dispatchEvent(new Event("update-cart-count"));
    } catch {
      toast.error("❌ Failed to add to cart");
    }
  };

  // ---------- REVIEWS ----------
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReview(product._id, { rating, comment });
      toast.success("✅ Review submitted!");
      setRating(0);
      setComment("");
      await fetchProduct(product._id);

      // 🔔 bell counter refresh
      window.dispatchEvent(new Event("refresh-notifications"));

    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Error submitting review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    setDeletingReviewId(reviewId);
    try {
      await deleteReview(product._id, reviewId);
      toast.success("✅ Review deleted");
      await fetchProduct(product._id);

      // 🔔 bell counter refresh
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Failed to delete review");
    } finally {
      setDeletingReviewId(null);
    }
  };

  // ---------- DATA FETCH ----------
  const fetchRelatedProducts = async (baseProduct) => {
    try {
      setRelatedLoading(true);
      const data = await getRecommendedProducts(baseProduct._id);
      const safe = Array.isArray(data) ? data : [];
      setRelatedProducts(safe);

      if (safe.length > 0) {
        window.dispatchEvent(
          new CustomEvent("related-products-notification", {
            detail: {
              baseProduct,
              relatedProducts: safe.slice(0, 3),
            },
          })
        );
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    } finally {
      setRelatedLoading(false);
    }
  };

  const fetchProduct = async (productId) => {
    try {
      const data = await getProductById(productId);
      setProduct(data);

      if (data && data._id) {
        await fetchRelatedProducts(data);
        await updateCartStatusForProduct(data._id);
      }

      setLoading(false);
    } catch {
      toast.error("❌ Failed to fetch product");
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    setActiveImageIndex(0);
    setSelectedVariantIndex(null);
    setQuantity(1);
    setCartItemId(null);

    if (instantProduct && instantProduct._id === id) {
      setProduct(instantProduct);
      setLoading(false);
      fetchRelatedProducts(instantProduct);
      updateCartStatusForProduct(instantProduct._id);
    } else {
      setLoading(true);
      fetchProduct(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location.state]);

  useEffect(() => {
    checkWishlistStatus();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (product && product._id) {
      updateCartStatusForProduct(product._id);
    }
  }, [isAuthenticated, product]);

  // ✅ handle ?focus=reviews&reviewId=... from notification link
  useEffect(() => {
    if (!product) return;

    const params = new URLSearchParams(location.search);
    const focus = params.get("focus");
    const reviewId = params.get("reviewId");

    if (focus === "reviews") {
      setActiveTab("reviews");

      setTimeout(() => {
        if (reviewId) {
          const el = document.getElementById(`review-${reviewId}`);
          if (el) {
            el.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });

            el.classList.add("ring-2", "ring-red-400", "ring-offset-2");
            setTimeout(() => {
              el.classList.remove(
                "ring-2",
                "ring-red-400",
                "ring-offset-2"
              );
            }, 1500);
            return;
          }
        }

        if (reviewsRef.current) {
          reviewsRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 400);
    }
  }, [location.key, product, location.search]);

  // ---------- RENDER GUARDS ----------
  if (!product && loading)
    return <div className="p-6 text-center">Loading...</div>;
  if (!product && !loading)
    return <div className="p-6 text-center">Product not found.</div>;

  const images =
    product.images && product.images.length > 0
      ? product.images.map((img) => img.url || img)
      : [product.image];

  const mainImage = images[activeImageIndex] || product.image;

  const availableStock = getAvailableStock();
  const isOutOfStock = availableStock <= 0;
  const isInCart = !!cartItemId;

  // ---------- JSX ----------
  return (
    <>
      {/* Breadcrumb bar */}
      <div className="bg-[#f5f5f5] border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs md:text-sm text-gray-600 flex items-center gap-2">
          <FiHome className="inline-block w-4 h-4" />
          <Link to="/" className="hover:underline hover:text-gray-900">
            Home
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-500">Products</span>
          <span className="text-gray-400">/</span>
          <span className="font-semibold text-gray-900 truncate">
            {product.name}
          </span>
        </div>
      </div>

      {/* MAIN SECTION */}
      <div className="bg-white">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-10">
              {/* LEFT: gallery */}
              <div className="flex gap-4 w-full lg:w-1/2">
                {/* Thumbnails column */}
                <div className="flex lg:flex-col gap-3 lg:w-24 w-24">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImageIndex(idx)}
                      className={`border rounded-md overflow-hidden bg-gray-50 flex-shrink-0 ${
                        idx === activeImageIndex
                          ? "border-gray-900"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        className="w-full h-20 object-cover"
                      />
                    </button>
                  ))}
                </div>

                {/* Main image */}
                <div className="flex-1 bg-[#f3f3f3] rounded-2xl flex items-center justify-center border border-gray-200">
                  <img
                    src={mainImage}
                    alt={product.name}
                    className="w-full h-[380px] md:h-[440px] object-contain"
                  />
                </div>
              </div>

              {/* RIGHT: info panel */}
              <div className="flex-1">
                <p className="text-xs font-semibold tracking-[0.25em] uppercase text-red-500 mb-2">
                  {product.category?.toUpperCase() || "APPAREL"}
                </p>

                <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2 leading-tight">
                  {product.name}
                </h1>

                {product.discountPercent > 0 && (
                  <span className="inline-block bg-[#e7425a] text-white text-[10px] px-2 py-1 uppercase tracking-[0.18em] rounded-sm mb-3">
                    -{product.discountPercent}%
                  </span>
                )}

                <div className="flex items-baseline gap-3 mb-4">
                  <p className="text-2xl md:text-3xl font-semibold text-red-500">
                    Rs. {product.price.toFixed(2)}
                  </p>
                  {product.originalPrice && (
                    <p className="text-sm md:text-base text-gray-400 line-through">
                      Rs. {product.originalPrice.toFixed(2)}
                    </p>
                  )}
                </div>

                <p className="text-xs uppercase tracking-[0.25em] text-gray-500 mb-4">
                  {product.subCategory || "Shoes"}
                </p>

                <p className="text-sm text-gray-600 mb-8 max-w-md leading-relaxed">
                  {product.shortDescription ||
                    "This high-performance sportswear piece offers a relaxed fit, premium fabric feel and everyday comfort – perfect for both training and casual wear."}
                </p>

                {/* SIZE */}
                {product.variants && product.variants.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-700 mb-3">
                      Size
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {product.variants.map((v, idx) => {
                        const isActive = idx === selectedVariantIndex;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedVariantIndex(idx)}
                            className={`min-w-[3.2rem] h-10 rounded-md text-xs font-medium border transition flex items-center justify-center ${
                              isActive
                                ? "bg-gray-900 text-white border-gray-900"
                                : "border-gray-300 text-gray-800 hover:border-gray-900"
                            }`}
                          >
                            {v.size}
                          </button>
                        );
                      })}
                    </div>
                    {selectedVariantIndex === null && (
                      <p className="mt-2 text-xs text-red-500">
                        Please select a size.
                      </p>
                    )}
                  </div>
                )}

                {/* COLOR */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mb-6">
                    <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-700 mb-3">
                      Color
                    </p>
                    <div className="flex items-center gap-3">
                      {product.colors.map((c, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-8 h-8 rounded-full border border-gray-300"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* QTY + STOCK */}
                {(() => {
                  const canDecrease = quantity > 1;
                  const canIncrease =
                    !isOutOfStock && quantity < availableStock;

                  return (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-8">
                      {/* QTY */}
                      <div>
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-700 mb-3">
                          Qty
                        </p>
                        <div
                          className={`flex items-center rounded-full overflow-hidden w-[160px] border ${
                            isOutOfStock
                              ? "border-gray-200 opacity-60 cursor-not-allowed"
                              : "border-gray-300"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={handleDecreaseQty}
                            disabled={!canDecrease || isOutOfStock}
                            style={{
                              visibility:
                                quantity === 1 ? "hidden" : "visible",
                            }}
                            className={`px-4 py-2 text-lg border-r ${
                              canDecrease && !isOutOfStock
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-300 cursor-default"
                            }`}
                          >
                            -
                          </button>

                          <span className="px-4 py-2 text-sm min-w-[40px] text-center">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={handleIncreaseQty}
                            disabled={!canIncrease}
                            className={`px-4 py-2 text-lg border-l ${
                              canIncrease
                                ? "text-gray-700 hover:bg-gray-100"
                                : "text-gray-300 cursor-not-allowed"
                            }`}
                          >
                            +
                          </button>
                        </div>

                        {!isOutOfStock && quantity === availableStock && (
                          <p className="mt-1 text-[11px] text-red-500">
                            You&apos;ve selected all available stock.
                          </p>
                        )}
                      </div>

                      {/* STOCK */}
                      <div className="flex-1">
                        <p className="text-xs font-semibold tracking-[0.25em] uppercase text-gray-700 mb-2">
                          Stock
                        </p>
                        <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-red-400 transition-all"
                            style={{
                              width: isOutOfStock
                                ? "0%"
                                : `${
                                    availableStock < 100
                                      ? availableStock
                                      : 100
                                  }%`,
                            }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-gray-500">
                          {isOutOfStock
                            ? "Out of stock"
                            : `${availableStock} item${
                                availableStock > 1 ? "s" : ""
                              } available`}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* BUTTONS */}
                <div className="flex flex-col gap-3 max-w-md">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-[#12141f] hover:bg.black text-white px-6 py-3 rounded-md text-xs font-semibold tracking-[0.2em] uppercase"
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock
                      ? "Out of Stock"
                      : isInCart
                      ? "Update Cart"
                      : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="w-full bg-[#e7425a] hover:bg-[#d63b52] text-white px-6 py-3 rounded-md text-xs font-semibold tracking-[0.2em] uppercase shadow-sm"
                    disabled={isOutOfStock}
                  >
                    {isOutOfStock ? "Unavailable" : "Buy It Now"}
                  </button>

                  {isInCart && (
                    <button
                      type="button"
                      onClick={handleRemoveFromCart}
                      className="w-full text-[11px] font-semibold tracking-[0.18em] uppercase text-red-500 hover:underline"
                    >
                      Remove from Cart
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-md text-xs font-semibold tracking-[0.2em] uppercase border ${
                      isWishlisted
                        ? "border-red-500 text-red-500"
                        : "border-gray-400 text-gray-700"
                    } hover:bg-gray-50`}
                  >
                    <FaHeart
                      className={isWishlisted ? "text-red-500" : "text-gray-600"}
                    />
                    {isWishlisted ? "Added to Wishlist" : "Add to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: Tabs + Related + Right Banner */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2.4fr)_minmax(260px,0.8fr)] gap-10">
            {/* LEFT: Tabs + content + related products */}
            <div>
              {/* Cream box wrapper */}
              <div className="bg-[#f9f6f1] rounded-2xl border border-gray-200 px-6 py-6 mb-10">
                {/* Tabs */}
                <div className="border-b border-gray-200 flex gap-8 text-sm">
                  {["description", "size", "shipping", "reviews"].map((tab) => {
                    const labelMap = {
                      description: "Description",
                      size: "Size Guide",
                      shipping: "Shipping",
                      reviews: "Reviews",
                    };
                    return (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 -mb-px border-b-2 text-xs md:text-sm tracking-[0.18em] uppercase ${
                          activeTab === tab
                            ? "border-red-500 text-gray-900"
                            : "border-transparent text-gray-400 hover:text-gray-700"
                        }`}
                      >
                        {labelMap[tab]}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="pt-6 text-sm text-gray-700 leading-relaxed">
                  {activeTab === "description" && (
                    <div className="space-y-4">
                      <p>{product.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 text-sm">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            Size
                          </p>
                          <p className="text-gray-600">
                            {product.sizeInfo || "Standard athletic fit."}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            Style
                          </p>
                          <p className="text-gray-600">
                            {product.styleInfo ||
                              "Sport-inspired lifestyle piece."}
                          </p>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            Material
                          </p>
                          <p className="text-gray-600">
                            {product.materialInfo ||
                              "Premium blend designed for comfort and durability."}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6">
                        <p className="font-semibold text-gray-900 mb-1">
                          Handfeel
                        </p>
                        <p className="text-gray-600">
                          {product.handfeel ||
                            "Soft, smooth interior with a structured outer feel, ideal for all-day wear."}
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === "size" && (
                    <div>
                      <p className="mb-2">
                        Our sizes follow a standard athletic fit. If you prefer
                        a looser feel, we recommend sizing up.
                      </p>
                      <ul className="list-disc list-inside text-gray-600">
                        <li>Model is 5&apos;10&quot; and wears size M.</li>
                        <li>Chest: measure around the fullest part.</li>
                        <li>Waist: measure around the narrowest point.</li>
                      </ul>
                    </div>
                  )}

                  {activeTab === "shipping" && (
                    <div className="space-y-2">
                      <p>• Standard delivery within 3–5 working days.</p>
                      <p>• Free shipping on orders above a certain amount.</p>
                      <p>• Easy 7-day return policy on unused items.</p>
                    </div>
                  )}

                  {activeTab === "reviews" && (
                    <div ref={reviewsRef} className="space-y-6">
                      <div>
                        <h2 className="text-base font-semibold text-gray-900 mb-2">
                          Customer Reviews ({product.reviews?.length || 0})
                        </h2>

                        <div className="mb-3 flex items-center gap-2">
                          {product.rating ? (
                            <>
                              {renderStars(Math.round(product.rating))}
                              <span className="text-xs text-gray-600">
                                {product.rating.toFixed(1)} / 5
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-gray-500">
                              No ratings yet
                            </span>
                          )}
                        </div>

                        {product.reviews?.length > 0 ? (
                          product.reviews.map((review) => {
                            const canDelete =
                              user &&
                              (user.isAdmin ||
                                user.role === "admin" ||
                                (review.user &&
                                  (review.user === user._id ||
                                    review.user?._id === user._id)));

                            return (
                              <div
                                key={review._id}
                                id={`review-${review._id}`} // scroll target
                                className="border border-gray-200 p-4 rounded-lg mb-3 bg-white/70"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div>
                                    <span className="font-medium text-gray-800">
                                      {review.name}
                                    </span>
                                    <div className="mt-1">
                                      {renderStars(review.rating)}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500">
                                      {new Date(
                                        review.createdAt || Date.now()
                                      ).toLocaleDateString()}
                                    </span>
                                    {canDelete && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteReview(review._id)
                                        }
                                        disabled={
                                          deletingReviewId === review._id
                                        }
                                        className={`text-[11px] ${
                                          deletingReviewId === review._id
                                            ? "text-gray-400 cursor-not-allowed"
                                            : "text-red-500 hover:underline"
                                        }`}
                                      >
                                        {deletingReviewId === review._id
                                          ? "Deleting..."
                                          : "Delete"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-gray-600 text-sm mt-1">
                                  {review.comment}
                                </p>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-sm text-gray-500">
                            No reviews yet.
                          </p>
                        )}
                      </div>

                      {isAuthenticated ? (
                        <form onSubmit={handleReviewSubmit} className="mt-4">
                          <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                            Write a Review
                          </h3>
                          <label className="block mb-1 text-xs text-gray-600">
                            Rating
                          </label>
                          <select
                            value={rating}
                            onChange={(e) =>
                              setRating(Number(e.target.value))
                            }
                            className="border rounded px-3 py-2 mb-3 w-full text-sm"
                            required
                          >
                            <option value="">Select...</option>
                            <option value="1">⭐ - Poor</option>
                            <option value="2">⭐⭐ - Fair</option>
                            <option value="3">⭐⭐⭐ - Good</option>
                            <option value="4">⭐⭐⭐⭐ - Very Good</option>
                            <option value="5">⭐⭐⭐⭐⭐ - Excellent</option>
                          </select>

                          <label className="block mb-1 text-xs text-gray-600">
                            Comment
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="border rounded px-3 py-2 mb-3 w-full text-sm"
                            rows="3"
                            required
                          />

                          <button
                            type="submit"
                            className="bg-gray-900 text-white px-5 py-2 rounded text-xs font-semibold tracking-[0.16em] uppercase"
                          >
                            Submit Review
                          </button>
                        </form>
                      ) : (
                        <p className="mt-4 text-sm text-gray-500">
                          Please{" "}
                          <Link
                            to="/login"
                            className="text-blue-600 underline"
                          >
                            login
                          </Link>{" "}
                          to write a review.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* RELATED PRODUCTS */}
              <div className="mt-10">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm md:text-base font-semibold tracking-[0.18em] uppercase text-gray-900">
                    Related Products
                  </h2>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  {relatedLoading ? (
                    <p className="text-sm text-gray-500">
                      Loading related products...
                    </p>
                  ) : relatedProducts.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No related products available yet.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                      {relatedProducts.slice(0, 3).map((rp) => {
                        const image =
                          (rp.images && rp.images[0]?.url) ||
                          rp.image ||
                          "/placeholder.png";
                        const isCardWishlisted = wishlistIds.includes(rp._id);

                        return (
                          <div
                            key={rp._id}
                            onClick={() => {
                              navigate(`/product/${rp._id}`, {
                                state: { product: rp },
                              });
                              window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }}
                            className="group bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition cursor-pointer"
                          >
                            {/* IMAGE AREA */}
                            <div className="relative bg-[#f5f5f5]">
                              <img
                                src={image}
                                alt={rp.name}
                                className="w-full h-60 object-contain"
                              />

                              {/* DISCOUNT BADGE */}
                              {rp.discountPercent > 0 && (
                                <span className="absolute top-3 left-3 bg-[#e7425a] text-white text-[10px] px-2 py-1 uppercase tracking-[0.18em] rounded-sm">
                                  -{rp.discountPercent}%
                                </span>
                              )}

                              {/* FAVOURITE ICON */}
                              <div className="absolute top-3 right-3 flex flex-col gap-2">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRelatedWishlistToggle(rp._id);
                                  }}
                                  className={`w-9 h-9 rounded-sm shadow flex items-center justify-center text-xs transition ${
                                    isCardWishlisted
                                      ? "bg-[#12141f] text-white"
                                      : "bg-white/90 text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  <FaHeart />
                                </button>
                              </div>

                              {/* ADD TO CART BAR */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddRelatedToCart(rp._id);
                                }}
                                className="absolute bottom-0 left-0 right-0 bg-[#12141f] text-white text-[11px] tracking-[0.18em] uppercase py-2 text-center opacity-0 group-hover:opacity-100 transition"
                              >
                                Add to Cart
                              </button>
                            </div>

                            {/* TEXT AREA */}
                            <div className="p-4">
                              <p className="text-[11px] uppercase tracking-[0.22em] text-[#e7425a] mb-1">
                                {rp.category || "Apparel"}
                              </p>
                              <p className="text-sm font-semibold text-gray-900 mb-1 line-clamp-1">
                                {rp.name}
                              </p>

                              <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-2">
                                {rp.brand || "KhelBazar"}
                              </p>

                              <div className="flex items-baseline gap-2">
                                <span className="text-sm font-semibold text-gray-900">
                                  Rs. {Number(rp.price || 0).toFixed(2)}
                                </span>
                                {rp.originalPrice &&
                                  rp.originalPrice > rp.price && (
                                    <span className="text-xs text-gray-400 line-through">
                                      Rs. {Number(rp.originalPrice).toFixed(2)}
                                    </span>
                                  )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT: tall banner */}
            <aside className="hidden lg:block">
              <div className="h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div
                  className="h-full bg-cover bg-center relative"
                  style={{ backgroundImage: `url(${BannerImg})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-white/5" />
                  <div className="relative h-full flex flex-col justify-end p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.3em] text-teal-700 mb-2">
                      KhelBazar
                    </p>
                    <h3 className="text-xl font-semibold mb-1">
                      Reach Your Highest Peak
                    </h3>
                    <p className="text-xs text-gray-100 mb-4 max-w-[220px]">
                      Performance gear for players who never stop climbing.
                    </p>
                    <button
                      onClick={() => {
                        navigate("/products");
                        window.scrollTo({
                          top: 0,
                          behavior: "smooth",
                        });
                      }}
                      className="inline-flex items-center justify-center px-5 py-2 bg-[#e7425a] hover:bg-[#d63b52] text-white text-xs uppercase tracking-[0.2em] rounded-full transition"
                    >
                      Explore More
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailPage;


