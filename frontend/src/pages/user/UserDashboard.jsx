// src/pages/user/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import HeroSlider from "../../components/common/HeroSlider";
import { getAllProducts } from "../../services/productService";
import { addToCart } from "../../services/cartService";
import {
  addToWishlist as addToWishlistBackend,
  removeFromWishlist as removeFromWishlistBackend,
  getWishlistItems,
} from "../../services/wishlistService";
import { useAuth } from "../../auth/AuthProvider";

import toast from "react-hot-toast";
import { FaHeart } from "react-icons/fa";
import { FiX, FiMaximize2 } from "react-icons/fi";

// 🔥 LOCAL ASSET IMAGES
import brand1 from "../../assets/brand1.png";
import brand2 from "../../assets/brand2.png";
import brand3 from "../../assets/brand3.png";
import brand4 from "../../assets/brand4.png";
import brand5 from "../../assets/brand5.png";

import promoLeft from "../../assets/promo-left.png";
import promoRight from "../../assets/promo-right.png";

// ---------- helper: get proper image from your schema ----------
const getProductImage = (product) => {
  if (!product) return "/no-image.png";

  if (product.image?.url) return product.image.url;
  if (typeof product.image === "string") return product.image;

  if (product.images && product.images.length > 0) {
    const first = product.images[0];
    if (first?.url) return first.url;
  }

  return "/no-image.png";
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [zoomProduct, setZoomProduct] = useState(null); // for quick view modal

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ---------- load products ----------
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data || []);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // ---------- load wishlist ----------
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const data = await getWishlistItems();
        const ids =
          data?.items?.map((item) => item.product?._id || item._id) || [];
        setWishlistIds(new Set(ids));
      } catch (err) {
        console.error("Failed to fetch wishlist", err);
      }
    };
    fetchWishlist();
  }, [user]);

  // ---------- derived lists ----------
  const featuredProducts = products.filter((p) => p.isFeatured).slice(0, 4);

  const bestSellerProducts = products
    .slice()
    .sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0))
    .slice(0, 8);

  // ---------- handlers ----------
  const handleLoadMore = () => {
    navigate("/products?featured=true");
    scrollToTop();
  };

  const handleWishlistToggle = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to use wishlist");
      return;
    }

    try {
      if (wishlistIds.has(productId)) {
        await removeFromWishlistBackend(productId);
        const newSet = new Set(wishlistIds);
        newSet.delete(productId);
        setWishlistIds(newSet);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlistBackend(productId);
        const newSet = new Set(wishlistIds);
        newSet.add(productId);
        setWishlistIds(newSet);
        toast.success("Added to wishlist");
      }
    } catch (err) {
      console.error(err);
      toast.error("Could not update wishlist");
    }
  };

  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to add to cart");
      return;
    }

    try {
      await addToCart(product._id, 1);
      toast.success("Added to cart");
    } catch (err) {
      console.error(err);
      toast.error("Could not add to cart");
    }
  };

  const handleQuickView = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    setZoomProduct(product);
  };

  const goCategory = (category) => {
    const encoded = encodeURIComponent(category);
    navigate(`/products?category=${encoded}`);
    scrollToTop();
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <div className="bg-white">
      {/* ================= HERO SLIDER ================= */}
      <HeroSlider />

      {/* ================= BRANDS + PROMO SECTION ================= */}
      <section className="pt-6 pb-12 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-0">
          {/* BRANDS TITLE */}
          <h3 className="text-center text-[14px] tracking-[0.3em] font-semibold text-red-500 mb-8">
            BRANDS
          </h3>

          {/* BRAND LOGOS */}
          <div className="w-full flex flex-wrap justify-between items-center gap-8 mb-10 opacity-90">
            <img
              src={brand1}
              alt="brand"
              className="h-14 object-contain grayscale hover:grayscale-0 transition"
            />
            <img
              src={brand2}
              alt="brand"
              className="h-14 object-contain grayscale hover:grayscale-0 transition"
            />
            <img
              src={brand3}
              alt="brand"
              className="h-12 object-contain grayscale hover:grayscale-0 transition"
            />
            <img
              src={brand4}
              alt="brand"
              className="h-12 object-contain grayscale hover:grayscale-0 transition"
            />
            <img
              src={brand5}
              alt="brand"
              className="h-12 object-contain grayscale hover:grayscale-0 transition"
            />
          </div>

          {/* ================= PROMO BANNERS (IMAGE + BUTTON) ================= */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* LEFT PROMO – Shop Now */}
            <div className="relative rounded-xl overflow-hidden shadow-sm bg-[#f7f6f4]">
              <img
                src={promoLeft}
                alt="Promo left"
                className="w-full h-[260px] object-cover"
              />

              {/* BUTTON OVERLAY */}
              <div className="absolute bottom-10 left-[50px]">
                <button
                  onClick={() => {
                    navigate("/products");
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-base font-semibold text-[#333] hover:text-[#0f6b6f] transition"
                >
                  Shop Now
                  <span className="text-[#0f6b6f] text-lg">→</span>
                </button>
              </div>
            </div>

            {/* RIGHT PROMO – Explore More */}
            <div className="relative rounded-xl overflow-hidden shadow-sm bg-[#1f1f21]">
              <img
                src={promoRight}
                alt="Promo right"
                className="w-full h-[260px] object-cover"
              />

              {/* BUTTON OVERLAY */}
              <div className="absolute left-9 bottom-[45px]">
                <button
                  onClick={() => {
                    navigate("/products");
                    scrollToTop();
                  }}
                  className="flex items-center gap-2 text-base font-semibold text-white hover:text-[#ff6b81] transition"
                >
                  Explore More
                  <span className="text-[#ff6b81] text-lg">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY ICON ROW ================= */}
      <section className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 py-6 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600 uppercase tracking-wide">
          <button
            onClick={() => goCategory("Shoes")}
            className="flex items-center gap-2 hover:text-[#0f6b6f] transition"
          >
            <span className="h-7 w-7 rounded-full bg-gray-100" />
            <span>Shoes</span>
          </button>
          <button
            onClick={() => goCategory("Basketballs")}
            className="flex items-center gap-2 hover:text-[#0f6b6f] transition"
          >
            <span className="h-7 w-7 rounded-full bg-gray-100" />
            <span>Basketballs</span>
          </button>
          <button
            onClick={() => goCategory("Bags")}
            className="flex items-center gap-2 hover:text-[#0f6b6f] transition"
          >
            <span className="h-7 w-7 rounded-full bg-gray-100" />
            <span>Bags</span>
          </button>
          <button
            onClick={() => goCategory("Coaching & Training")}
            className="flex items-center gap-2 hover:text-[#0f6b6f] transition"
          >
            <span className="h-7 w-7 rounded-full bg-gray-100" />
            <span>Training</span>
          </button>
        </div>
      </section>

      {/* ================= FEATURED SECTION ================= */}
      <section className="max-w-6xl mx-auto px-4 lg:px-0 py-10">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
              Featured
            </h2>
            <p className="text-sm text-gray-500">
              Hand-picked highlights from KhelBazar.
            </p>
          </div>

          {/* Category tabs */}
          <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-medium">
            <button
              onClick={() => {
                navigate("/products");
                scrollToTop();
              }}
              className="text-[#0f6b6f] hover:text-[#0f6b6f]"
            >
              All
            </button>
            <button
              onClick={() => goCategory("Shoes")}
              className="hover:text-[#0f6b6f]"
            >
              Shoes
            </button>
            <button
              onClick={() => goCategory("Basketballs")}
              className="hover:text-[#0f6b6f]"
            >
              Basketballs
            </button>
            <button
              onClick={() => goCategory("Coaching & Training")}
              className="hover:text-[#0f6b6f]"
            >
              Training
            </button>
            <button
              onClick={() => goCategory("Bags")}
              className="hover:text-[#0f6b6f]"
            >
              Bags
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loadingProducts && featuredProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Loading featured products…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((p) => {
              const img = getProductImage(p);
              const inWishlist = wishlistIds.has(p._id);
              return (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  onClick={scrollToTop}
                  className="group relative border border-gray-100 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition"
                >
                  {/* Product Image Block */}
                  <div className="relative bg-[#f7f7f8] aspect-[4/5] flex items-center justify-center overflow-hidden">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Discount badge */}
                    {p.discountPercent > 0 && (
                      <span className="absolute left-3 top-3 text-[10px] uppercase tracking-wide bg-[#0f6b6f] text-white px-2 py-1 rounded-sm">
                        -{p.discountPercent}%
                      </span>
                    )}

                    {/* Wishlist + Zoom */}
                    <div className="absolute right-3 top-3 flex flex-col gap-2">
                      <button
                        onClick={(e) => handleWishlistToggle(e, p._id)}
                        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
                      >
                        <FaHeart
                          size={14}
                          className={
                            inWishlist ? "text-[#0f6b6f]" : "text-gray-600"
                          }
                        />
                      </button>
                      <button
                        onClick={(e) => handleQuickView(e, p)}
                        className="w-8 h-8 rounded bg-white shadow flex items-center justify-center hover:bg-gray-100"
                      >
                        <FiMaximize2 size={14} className="text-gray-700" />
                      </button>
                    </div>

                    {/* ADD TO CART bar on hover */}
                    <button
                      onClick={(e) => handleAddToCart(e, p)}
                      className="absolute left-0 right-0 bottom-0 bg-black text-white text-[11px] uppercase tracking-[0.2em] py-2 text-center opacity-0 translate-y-full group-hover:opacity-100 group-hover:translate-y-0 transition-all"
                    >
                      Add to cart
                    </button>
                  </div>

                  {/* Text Content */}
                  <div className="p-4">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                      {p.brand} • {p.category}
                    </p>

                    <p className="text-sm font-medium text-gray-900 line-clamp-2 mt-1">
                      {p.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Rs. {p.price}
                      </span>

                      {p.originalPrice && (
                        <span className="text-xs line-through text-gray-400">
                          Rs. {p.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More */}
        <div className="flex justify-center mt-10">
          <button
            onClick={handleLoadMore}
            className="px-8 py-2 border border-gray-300 rounded-none text-xs uppercase tracking-[0.2em] hover:border-[#0f6b6f] hover:text-[#0f6b6f] transition"
          >
            Load More
          </button>
        </div>
      </section>
<section className="w-full max-w-6xl mx-auto my-10">
  <div className="relative w-full h-[240px] md:h-[280px] lg:h-[320px] rounded-3xl overflow-hidden shadow-sm">

    {/* Background Image */}
    <img
      src="src/assets/templates1.png"
      alt="Training Banner"
      className="w-full h-full object-cover"
    />

    {/* Dark overlay if you want clarity */}
    <div className="absolute inset-0 bg-black/10"></div>

    {/* Text + Button */}
    <div className="absolute left-6 sm:left-10 top-6 sm:top-10">
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900">
        UNLOCK YOUR
        <br /> BEST SELF
      </h2>

      <p className="hidden sm:block mt-3 text-gray-700 text-sm max-w-sm">
        Elevate your style on and off the court with our fashionable sportswear
      </p>

      <button
        onClick={() => goCategory("Coaching & Training")}
        className="mt-6 inline-flex items-center justify-center px-7 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] rounded-full hover:bg-neutral-800 transition"
      >
        Shop Training Gear
      </button>
    </div>
  </div>
</section>


      {/* ================= BEST SELLER GRID ================= */}
      <section className="max-w-6xl mx-auto px-4 lg:px-0 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            Best Seller
          </h2>
          <button
            onClick={() => {
              navigate("/products?sort=top");
              scrollToTop();
            }}
            className="text-xs uppercase tracking-wide text-gray-500 hover:text-[#0f6b6f]"
          >
            View all
          </button>
        </div>

        {loadingProducts && bestSellerProducts.length === 0 ? (
          <p className="text-sm text-gray-500">Loading products…</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {bestSellerProducts.map((p) => {
              const img = getProductImage(p);
              return (
                <Link
                  key={p._id}
                  to={`/products/${p._id}`}
                  onClick={scrollToTop}
                  className="group border border-gray-100 rounded-2xl bg-white overflow-hidden hover:shadow-md transition flex flex-col"
                >
                  <div className="relative bg-[#f7f7f8] aspect-[4/5] flex items-center justify-center overflow-hidden">
                    <img
                      src={img}
                      alt={p.name}
                      className="w-full h-full object-contain p-4 group-hover:scale-105 transition"
                    />
                    {p.discountPercent > 0 && (
                      <span className="absolute left-3 top-3 text-[10px] uppercase tracking-wide bg-[#0f6b6f] text-white px-2 py-1 rounded-sm">
                        -{p.discountPercent}%
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                      {p.category || "Basketball"}
                    </p>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {p.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Rs. {p.price}
                      </span>
                      {p.originalPrice && (
                        <span className="text-xs line-through text-gray-400">
                          Rs. {p.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ============== QUICK VIEW (ZOOM) MODAL ============== */}
      {zoomProduct && (
        <div className="fixed inset-0 z-40 bg-black/60 flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-3xl w-full mx-4 relative p-6">
            <button
              onClick={() => setZoomProduct(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center hover:bg-gray-100"
            >
              <FiX className="text-gray-800" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="bg-[#f7f7f8] rounded-2xl flex items-center justify-center p-4">
                <img
                  src={getProductImage(zoomProduct)}
                  alt={zoomProduct.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 mb-1">
                  {zoomProduct.brand} • {zoomProduct.category}
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {zoomProduct.name}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {zoomProduct.description}
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    Rs. {zoomProduct.price}
                  </span>
                  {zoomProduct.originalPrice && (
                    <span className="text-sm line-through text-gray-400">
                      Rs. {zoomProduct.originalPrice}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleAddToCart(e, zoomProduct)}
                  className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.2em] rounded-full hover:bg-[#111827] transition"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

