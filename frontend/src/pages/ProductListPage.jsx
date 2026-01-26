// src/pages/ProductListPage.jsx
import React, { useEffect, useState } from "react";
import { getAllProducts } from "../services/productService";
import { getAllCategories } from "../services/categoryService";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHome } from "react-icons/fi";
import { FaHeart, FaShoppingCart, FaFilter, FaStar } from "react-icons/fa";
import {
  addToWishlist as addToWishlistBackend,
  removeFromWishlist as removeFromWishlistBackend,
  getWishlistItems,
} from "../services/wishlistService";
import { addToCart, getCart, removeFromCart } from "../services/cartService";
import { useAuth } from "../auth/AuthProvider";

const ProductListPage = () => {
  // 🔍 URL filters
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const featuredFlag = searchParams.get("featured") === "true";

  // 🔑 cache key per search+category+featured
  const cacheKey = `KhelBazar_products_${keyword || "all"}_${
    category || "all"
  }_${featuredFlag ? "featured" : "all"}`;

  // ===== STATE =====
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [sort, setSort] = useState("az");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewAll, setViewAll] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartMap, setCartMap] = useState({}); // productId -> true

  // sidebar stuff
  const [categories, setCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [overallMinPrice, setOverallMinPrice] = useState(0);
  const [overallMaxPrice, setOverallMaxPrice] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // helper: apply products + update price ranges
  const applyProducts = (data) => {
    const list = data || [];
    setProducts(list);
    setCurrentPage(1);

    if (list.length > 0) {
      const prices = list.map((p) => Number(p.price || 0));
      const minP = Math.min(...prices);
      const maxP = Math.max(...prices);
      setOverallMinPrice(minP);
      setOverallMaxPrice(maxP);
      setMinPrice(minP);
      setMaxPrice(maxP);
    } else {
      setOverallMinPrice(0);
      setOverallMaxPrice(0);
      setMinPrice(0);
      setMaxPrice(0);
    }
  };

  // ===== LOAD PRODUCTS (cache + API) =====
  useEffect(() => {
    // 1) try cache for instant render
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        applyProducts(cached);
        setLoadingProducts(false); // already have something to show
      } else {
        applyProducts([]);
        setLoadingProducts(true);
      }
    } catch {
      applyProducts([]);
      setLoadingProducts(true);
    }

    // 2) fetch fresh from API in background
    const fetchData = async () => {
      try {
        const params = { search: keyword, category };
        if (featuredFlag) {
          params.featured = true; // 👉 this hits backend featured filter
        }

        const data = await getAllProducts(params);
        applyProducts(data);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data || []));
        } catch {
          // ignore quota error
        }
      } catch (err) {
        toast.error("❌ Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, keyword, category, featuredFlag]);

  // ===== LOAD REAL CATEGORIES FOR SIDEBAR =====
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res || []);
      } catch (err) {
        console.error("Error loading categories", err);
      }
    };
    fetchCategories();
  }, []);

  // ===== CART STATUS (productId -> true) =====
  const loadCartStatus = async () => {
    if (!user) {
      setCartMap({});
      return;
    }
    try {
      const cart = await getCart();
      const map = {};
      (cart.items || []).forEach((item) => {
        if (item.product?._id) {
          map[String(item.product._id)] = true;
        }
      });
      setCartMap(map);
    } catch (err) {
      console.error("Error loading cart", err);
    }
  };

  useEffect(() => {
    if (loading) return;
    loadCartStatus();

    const handler = () => loadCartStatus();
    window.addEventListener("update-cart-count", handler);
    return () => window.removeEventListener("update-cart-count", handler);
  }, [user, loading]);

  // ===== WISHLIST COUNTS =====
  useEffect(() => {
    if (loading) return;
    if (!user) {
      setWishlistItems([]);
      return;
    }

    const loadWishlist = async () => {
      try {
        const items = await getWishlistItems();
        setWishlistItems(items.map((item) => item.product?._id || item._id));
      } catch (err) {
        console.error("Error loading wishlist", err);
      }
    };

    loadWishlist();

    const handleWishlistUpdate = () => loadWishlist();
    window.addEventListener("update-wishlist-count", handleWishlistUpdate);
    return () => {
      window.removeEventListener("update-wishlist-count", handleWishlistUpdate);
    };
  }, [user, loading]);

  // ===== WISHLIST TOGGLE =====
  const handleWishlistClick = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast("🚫 Please login to manage wishlist", {
        icon: "❌",
        style: {
          border: "1px solid #f87171",
          padding: "12px",
          color: "#991b1b",
          background: "#fee2e2",
        },
      });
      return;
    }

    try {
      if (wishlistItems.includes(product._id)) {
        await removeFromWishlistBackend(product._id);
        toast("❌ Removed from wishlist");
      } else {
        await addToWishlistBackend([product._id]);
        toast.success("✅ Added to wishlist");
      }

      const updated = await getWishlistItems();
      setWishlistItems(updated.map((item) => item.product?._id || item._id));

      window.dispatchEvent(new Event("update-wishlist-count"));
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch {
      toast.error("❌ Something went wrong");
    }
  };

  // ===== ADD / REMOVE CART TOGGLE =====
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast("🚫 Please login to add to cart", {
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

    const key = String(product._id);
    const isInCart = !!cartMap[key];

    if (isInCart) {
      // already in cart -> remove
      try {
        const cart = await getCart();

        const existingItem = (cart.items || []).find(
          (item) => item.product && item.product._id === product._id
        );

        if (!existingItem) {
          toast.error("Item not found in cart");
          await loadCartStatus();
          return;
        }

        await removeFromCart(existingItem._id);

        toast("❌ Removed from cart", {
          icon: "🗑️",
          style: {
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          },
        });

        window.dispatchEvent(new Event("update-cart-count"));
        window.dispatchEvent(new Event("refresh-notifications"));
        loadCartStatus();
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to remove from cart", {
          style: {
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          },
        });
      }
      return;
    }

    // not in cart -> add
    try {
      await addToCart(product._id, 1);
      toast.success("✅ Added to cart!");
      window.dispatchEvent(new Event("update-cart-count"));
      window.dispatchEvent(new Event("refresh-notifications"));
      loadCartStatus();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to add to cart", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
    }
  };

  // ===== SIDEBAR DATA FROM PRODUCTS =====
  const categoryCounts = products.reduce((acc, p) => {
    const c = p.category || "Others";
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const brandCounts = products.reduce((acc, p) => {
    if (!p.brand) return acc;
    acc[p.brand] = (acc[p.brand] || 0) + 1;
    return acc;
  }, {});

  const uniqueBrands = Object.keys(brandCounts).sort();

  // ===== APPLY FILTERS =====
  let filteredProducts = [...products];

  if (selectedBrands.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      selectedBrands.includes(p.brand)
    );
  }

  filteredProducts = filteredProducts.filter((p) => {
    const price = Number(p.price || 0);
    return price >= minPrice && price <= maxPrice;
  });

  // ===== SORTING =====
  const sortedProducts = filteredProducts.sort((a, b) => {
    if (sort === "az") return a.name.localeCompare(b.name);
    if (sort === "za") return b.name.localeCompare(a.name);
    if (sort === "price") return a.price - b.price;
    if (sort === "priceDesc") return b.price - a.price;
    return 0;
  });

  // ===== PAGINATION =====
  const productsPerPage = 10;
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const paginatedProducts = viewAll
    ? sortedProducts
    : sortedProducts.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
      );

  const hasProducts = sortedProducts.length > 0;
  const startIndex = hasProducts
    ? (currentPage - 1) * productsPerPage + 1
    : 0;
  const endIndex = hasProducts
    ? viewAll
      ? sortedProducts.length
      : Math.min(currentPage * productsPerPage, sortedProducts.length)
    : 0;

  // ===== HANDLERS FOR SIDEBAR =====
  const handleCategoryClick = (catName) => {
    const params = new URLSearchParams(searchParams);
    if (!catName || catName === "All") {
      params.delete("category");
      params.delete("featured"); // 🔥 reset to normal when All Products clicked
    } else {
      params.set("category", catName);
    }
    navigate(`/products?${params.toString()}`);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setMinPrice(overallMinPrice);
    setMaxPrice(overallMaxPrice);
    handleCategoryClick("All");
  };

  // 🔹 Filters sidebar content
  const filtersContent = (
    <div className="space-y-6 text-sm">
      {/* CATEGORIES */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-800 mb-3">
          Categories
        </h3>
        <button
          onClick={() => handleCategoryClick("All")}
          className={`block w-full text-left mb-2 text-[13px] ${
            !category
              ? "text-teal-700 font-semibold"
              : "text-gray-700 hover:text-teal-700"
          }`}
        >
          All Products ({products.length})
        </button>

        {categories.map((cat) => {
          const name = cat.name;
          const count = categoryCounts[name] || 0;
          return (
            <button
              key={cat._id}
              onClick={() => handleCategoryClick(name)}
              className={`block w-full text-left mb-1.5 text-[13px] ${
                category === name
                  ? "text-teal-700 font-semibold"
                  : "text-gray-700 hover:text-teal-700"
              }`}
            >
              {name}{" "}
              <span className="text-gray-400 text-[11px]">({count})</span>
            </button>
          );
        })}
      </div>

      {/* BRANDS */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-800 mb-3">
          Brands
        </h3>
        {uniqueBrands.length === 0 ? (
          <p className="text-xs text-gray-500">No brand data</p>
        ) : (
          uniqueBrands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-[13px] mb-1.5 text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                className="rounded border-gray-300"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
              />
              <span>
                {brand}{" "}
                <span className="text-gray-400 text-[11px]">
                  ({brandCounts[brand] || 0})
                </span>
              </span>
            </label>
          ))
        )}
      </div>

      {/* SIZE – visual only */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-800 mb-3">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {["XS", "S", "M", "L", "XL", "2XL"].map((s) => (
            <button
              key={s}
              type="button"
              className="px-3 py-1 text-xs border border-gray-300 rounded hover:border-gray-900 hover:text-gray-900"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* PRICE – REAL RANGE */}
      <div className="border border-gray-200 rounded-xl p-4">
        <h3 className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-800 mb-3">
          Price
        </h3>

        {overallMaxPrice > overallMinPrice ? (
          <>
            <input
              type="range"
              min={overallMinPrice}
              max={overallMaxPrice}
              value={maxPrice}
              onChange={(e) => {
                const value = Number(e.target.value);
                setMaxPrice(value);
                if (value < minPrice) setMinPrice(value);
                setCurrentPage(1);
              }}
              className="w-full accent-red-500"
            />
            <div className="flex justify-between mt-2 gap-2">
              <div className="flex flex-col text-[11px] text-gray-500">
                <span>Min Price</span>
                <input
                  type="number"
                  value={minPrice}
                  min={overallMinPrice}
                  max={maxPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMinPrice(v);
                    if (v > maxPrice) setMaxPrice(v);
                    setCurrentPage(1);
                  }}
                  className="mt-1 border border-gray-300 rounded px-2 py-1 text-xs w-24"
                />
              </div>
              <div className="flex flex-col text-[11px] text-gray-500">
                <span>Max Price</span>
                <input
                  type="number"
                  value={maxPrice}
                  min={minPrice}
                  max={overallMaxPrice}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setMaxPrice(v);
                    if (v < minPrice) setMinPrice(v);
                    setCurrentPage(1);
                  }}
                  className="mt-1 border border-gray-300 rounded px-2 py-1 text-xs w-24"
                />
              </div>
            </div>
          </>
        ) : (
          <p className="text-xs text-gray-500">
            No price information available.
          </p>
        )}

        <button
          type="button"
          onClick={handleClearFilters}
          className="mt-4 text-[11px] uppercase tracking-[0.18em] text-teal-700 hover:underline"
        >
          × Clear All Filters
        </button>
      </div>
    </div>
  );

  // 🔳 simple skeleton rows for first load (no cache)
  const renderSkeleton = () => (
    <ul className="divide-y divide-gray-200">
      {[1, 2, 3].map((i) => (
        <li key={i} className="px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-col sm:flex-row gap-4 animate-pulse">
            <div className="w-full sm:w-40 md:w-44 h-40 bg-gray-200 rounded-xl" />
            <div className="flex-1 space-y-3">
              <div className="h-3 w-24 bg-gray-200 rounded" />
              <div className="h-4 w-52 bg-gray-200 rounded" />
              <div className="h-3 w-40 bg-gray-200 rounded" />
            </div>
            <div className="w-full sm:w-44 space-y-3">
              <div className="h-4 w-24 bg-gray-200 rounded ml-auto" />
              <div className="h-8 w-full bg-gray-200 rounded-full" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* BREADCRUMB STRIP */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiHome className="inline-block w-4 h-4" />
            <Link to="/" className="hover:underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">
              {featuredFlag ? "Featured Products" : "Products"}
            </span>
          </div>
          {keyword && (
            <p className="text-xs text-gray-500">
              Search results for{" "}
              <span className="font-semibold">&quot;{keyword}&quot;</span>
            </p>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              {featuredFlag ? "Featured Products" : "Products"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {loadingProducts && !hasProducts
                ? "Loading products..."
                : hasProducts
                ? `Showing ${startIndex}–${endIndex} of ${sortedProducts.length} results`
                : "No products found"}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs md:text-sm">
            {/* TOGGLE SIDEBAR BUTTON */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md bg-white hover:bg-gray-100"
            >
              <FaFilter className="text-xs" />
              <span>{isSidebarOpen ? "Hide Filters" : "Show Filters"}</span>
            </button>

            <span className="hidden sm:inline text-gray-600 whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-xs md:text-sm bg-white"
            >
              <option value="az">Alphabetically, A–Z</option>
              <option value="za">Alphabetically, Z–A</option>
              <option value="price">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* LAYOUT: SIDEBAR + PRODUCTS */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDEBAR */}
          <aside
            className={`transition-all duration-300 ${
              isSidebarOpen
                ? "max-h-[2000px] opacity-100 mb-4 lg:mb-0 w-full lg:w-64"
                : "max-h-0 opacity-0 overflow-hidden w-full lg:w-0 mb-0"
            }`}
          >
            {filtersContent}
          </aside>

          {/* RIGHT – PRODUCT LIST */}
          <section className="flex-1 bg-white border border-gray-200 rounded-[18px] overflow-hidden">
            {loadingProducts && products.length === 0 ? (
              renderSkeleton()
            ) : paginatedProducts.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">
                No products match your filters.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {paginatedProducts.map((product) => {
                  const isWishlisted = wishlistItems.includes(product._id);
                  const isInCart = !!cartMap[String(product._id)];

                  const image =
                    (product.images && product.images[0]?.url) ||
                    product.image ||
                    "/placeholder.png";

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

                  let descriptionPreview =
                    product.shortDescription && product.shortDescription.trim()
                      ? product.shortDescription.trim()
                      : "";

                  if (!descriptionPreview && product.description) {
                    const desc = String(product.description).trim();
                    descriptionPreview =
                      desc.length > 140 ? desc.slice(0, 140) + "..." : desc;
                  }

                  return (
                    <li key={product._id} className="hover:bg-gray-50">
                      <Link
                        to={`/product/${product._id}`}
                        state={{ product }} // instant detail page feel
                        className="flex flex-col sm:flex-row gap-4 px-4 py-4 md:px-6 md:py-5"
                        onClick={() =>
                          window.scrollTo({ top: 0, behavior: "smooth" })
                        }
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
                            {descriptionPreview || "No description available."}
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
                        <div className="w-full sm:w-44 md:w-52 flex flex-col items-end justify-between gap-3">
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

                          <div className="flex flex-col items-stretch gap-2 w-full">
                            {/* ADD / REMOVE CART BUTTON */}
                            <button
                              onClick={(e) => handleAddToCart(e, product)}
                              className={`flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white py-2 rounded-full ${
                                isInCart
                                  ? "bg-teal-700 hover:bg-teal-800"
                                  : "bg-[#111827] hover:bg-black"
                              }`}
                            >
                              <FaShoppingCart className="text-xs" />
                              {isInCart ? "Remove from Cart" : "Add to Cart"}
                            </button>

                            <button
                              onClick={(e) => handleWishlistClick(e, product)}
                              className={`flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.2em] border py-2 rounded-full ${
                                isWishlisted
                                  ? "border-red-500 text-red-500"
                                  : "border-gray-300 text-gray-600 hover:border-red-400 hover:text-teal-700"
                              }`}
                            >
                              <FaHeart
                                className={
                                  isWishlisted
                                    ? "text-red-500"
                                    : "text-gray-400"
                                }
                              />
                              {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                            </button>
                          </div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* PAGINATION + VIEW ALL */}
            {sortedProducts.length > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 px-4 md:px-6 py-4 border-t border-gray-200 text-xs">
                {!viewAll && totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                      disabled={currentPage === 1}
                    >
                      &lt;
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentPage(idx + 1)}
                        className={`px-3 py-1 border border-gray-300 rounded text-xs ${
                          currentPage === idx + 1
                            ? "bg-gray-900 text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(totalPages, prev + 1)
                        )
                      }
                      className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-40"
                      disabled={currentPage === totalPages}
                    >
                      &gt;
                    </button>
                  </div>
                )}

                {sortedProducts.length > productsPerPage && (
                  <button
                    onClick={() => setViewAll(!viewAll)}
                    className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900"
                  >
                    <span>
                      {viewAll ? "Show paginated view" : "View all products"}
                    </span>
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default ProductListPage;


