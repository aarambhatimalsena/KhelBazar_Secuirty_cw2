// src/pages/user/WishlistPage.jsx
import React, { useEffect, useState } from "react";
import {
  getWishlistItems,
  removeFromWishlist,
} from "../../services/wishlistService";
import { addToCart } from "../../services/cartService";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import { FaTrash, FaShoppingCart, FaStar } from "react-icons/fa";

// 🖼️ safe image helper
const getProductImage = (product) => {
  if (!product) return "/placeholder.png";

  if (product.image?.url) return product.image.url;
  if (typeof product.image === "string") return product.image;

  if (product.images && product.images.length > 0) {
    const first = product.images[0];
    if (first?.url) return first.url;
    if (typeof first === "string") return first;
  }

  return "/placeholder.png";
};

const WishlistPage = () => {
  // 🔥 init from cache for instant render
  const [wishlist, setWishlist] = useState(() => {
    try {
      const cached = localStorage.getItem("KhelBazar_wishlist_cache");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => wishlist.length === 0);

  // small helper to sync state + cache
  const syncWishlist = (items) => {
    setWishlist(items);
    try {
      localStorage.setItem(
        "KhelBazar_wishlist_cache",
        JSON.stringify(items || [])
      );
    } catch {
      // ignore quota error
    }
  };

  const fetchWishlist = async () => {
    try {
      const data = await getWishlistItems();
      syncWishlist(data || []);
    } catch (error) {
      if (!wishlist.length) {
        toast.error(
          error?.response?.data?.message || "Failed to fetch wishlist"
        );
      }
      syncWishlist([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    const prev = [...wishlist];

    // 🟢 optimistic remove + cache
    const updated = prev.filter((item) => {
      const p = item.product || item;
      return p._id !== productId;
    });
    syncWishlist(updated);

    try {
      await removeFromWishlist(productId);
      toast("Removed from wishlist", {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });

      window.dispatchEvent(new Event("update-wishlist-count"));
    } catch {
      // ❌ revert on fail
      syncWishlist(prev);
      toast.error("❌ Failed to remove item");
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await addToCart(product._id, 1);
      toast.success("✅ Added to cart");
      window.dispatchEvent(new Event("update-cart-count"));
    } catch (err) {
      toast.error("❌ Failed to add to cart");
    }
  };

  // 💫 skeleton for first load (no cache)
  const renderSkeleton = () => (
    <div className="bg-white border border-gray-200 rounded-[18px] p-6 space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="flex gap-4 animate-pulse border-b last:border-b-0 border-gray-100 pb-4"
        >
          <div className="w-24 h-24 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-28 bg-gray-200 rounded" />
            <div className="h-4 w-52 bg-gray-200 rounded" />
            <div className="h-3 w-40 bg-gray-200 rounded" />
          </div>
          <div className="w-32 space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-8 w-full bg-gray-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Breadcrumb – same style as product page */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiHome className="inline-block w-4 h-4" />
            <Link to="/" className="hover:underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">Wishlist</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">
              My Wishlist
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {loading && wishlist.length === 0
                ? "Loading your wishlist..."
                : wishlist.length === 0
                ? "You have no saved items yet."
                : `${wishlist.length} item${
                    wishlist.length > 1 ? "s" : ""
                  } in your wishlist`}
            </p>
          </div>

          <div className="text-xs text-gray-500">
            <span className="hidden sm:inline">
              Save your favourite products and move them to cart anytime.
            </span>
          </div>
        </div>

        {/* STATES */}
        {loading && wishlist.length === 0 ? (
          renderSkeleton()
        ) : wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-[18px] py-12 px-6 text-center">
            <p className="text-lg text-gray-700 mb-2">
              Your wishlist is empty.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Start exploring products and tap the heart icon to save them here.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] bg-[#111827] text-white px-6 py-3 rounded-full hover:bg-black"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <section className="bg-white border border-gray-200 rounded-[18px] overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {wishlist.map((item) => {
                const product = item.product || item;
                const image = getProductImage(product);

                // discount percent from DB or compute if you have originalPrice
                let discountPercent = null;
                if (
                  typeof product.discountPercent === "number" &&
                  product.discountPercent > 0
                ) {
                  discountPercent = product.discountPercent;
                } else if (
                  product.originalPrice &&
                  product.originalPrice > product.price
                ) {
                  discountPercent = Math.round(
                    ((product.originalPrice - product.price) /
                      product.originalPrice) *
                      100
                  );
                }

                const ratingValue = Number(product.rating || 0);
                const numReviews = Number(product.numReviews || 0);

                return (
                  <li key={product._id} className="hover:bg-gray-50">
                    {/* whole row clickable to product detail */}
                    <Link
                      to={`/product/${product._id}`}
                      className="flex flex-col sm:flex-row gap-4 px-4 py-4 md:px-6 md:py-5"
                    >
                      {/* IMAGE + DISCOUNT BADGE */}
                      <div className="relative w-full sm:w-40 md:w-44 flex-shrink-0 bg-white border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden">
                        {discountPercent && (
                          <span className="absolute top-2 left-2 bg-[#d60028] text-white text-[11px] font-semibold px-2 py-1 rounded-sm">
                            - {discountPercent}%
                          </span>
                        )}
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                          className="w-full h-40 object-contain p-3"
                        />
                      </div>

                      {/* DETAILS */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#e7425a] mb-1">
                          {product.category || "Shoes"}
                        </p>
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-2">
                          {product.brand || "KhelBazar"}
                        </p>
                        <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                          {product.shortDescription ||
                            "Performance-ready sports item designed for comfort and durability in every game."}
                        </p>
                        <ul className="text-[11px] text-gray-500 space-y-0.5">
                          <li>
                            <span className="font-semibold text-gray-700">
                              Availability:
                            </span>{" "}
                            {product.stock > 0
                              ? `${product.stock} in stock`
                              : "Out of stock"}
                          </li>
                        </ul>
                      </div>

                      {/* PRICE + RATING + ACTIONS */}
                      <div className="w-full sm:w-52 flex flex-col items-end justify-between gap-3">
                        {/* price */}
                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            Rs. {Number(product.price || 0).toFixed(2)}
                          </p>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <p className="text-xs text-gray-400 line-through">
                                Rs.{" "}
                                {Number(product.originalPrice).toFixed(2)}
                              </p>
                            )}
                        </div>

                        {/* rating */}
                        {(ratingValue > 0 || numReviews > 0) && (
                          <div className="flex items-center justify-end gap-1 text-xs">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={
                                  star <= Math.round(ratingValue)
                                    ? "text-[#d60028]"
                                    : "text-gray-300"
                                }
                                size={12}
                              />
                            ))}
                            <span className="text-gray-500 text-[11px]">
                              ({numReviews})
                            </span>
                          </div>
                        )}

                        {/* actions */}
                        <div className="flex flex-col items-stretch gap-2 w-full">
                          <button
                            onClick={(e) => handleAddToCart(e, product)}
                            className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] bg-[#111827] text-white py-2 rounded-full hover:bg-black"
                          >
                            <FaShoppingCart className="text-xs" />
                            Add to Cart
                          </button>

                          <button
                            onClick={(e) => handleRemove(e, product._id)}
                            className="flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] border py-2 rounded-full border-gray-300 text-gray-600 hover:border-red-400 hover:text-teal-700"
                          >
                            <FaTrash className="text-xs" />
                            Remove from Wishlist
                          </button>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </>
  );
};

export default WishlistPage;


