// src/pages/user/CartPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
} from "../../services/cartService";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaMinus, FaPlus, FaTrash } from "react-icons/fa";

// 🖼️ safe image helper (same style as other pages)
const getProductImage = (product) => {
  if (!product) return "/no-image.png";

  // single image object
  if (product.image?.url) return product.image.url;
  if (typeof product.image === "string") return product.image;

  // images array
  if (product.images && product.images.length > 0) {
    const first = product.images[0];
    if (first?.url) return first.url;
    if (typeof first === "string") return first;
  }

  return "/no-image.png";
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔁 INITIAL FETCH
  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCartItems(data.items || []);
    } catch (err) {
      toast.error("❌ Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // 💰 useMemo for total
  const total = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.quantity * (item.product?.price || 0),
        0
      ),
    [cartItems]
  );

  // 🔢 QUANTITY HANDLER (optimistic)
  const handleQuantity = async (productId, type) => {
    const item = cartItems.find((i) => i.product?._id === productId);
    if (!item) return;

    const maxStock =
      typeof item.product.stock === "number" ? item.product.stock : Infinity;

    let newQty = item.quantity;

    if (type === "inc") {
      if (item.quantity >= maxStock) {
        toast.error(
          `Only ${maxStock} piece${maxStock > 1 ? "s" : ""} available in stock`
        );
        return;
      }
      newQty = item.quantity + 1;
    } else {
      newQty = item.quantity - 1;
      if (newQty < 1) return;
    }

    // 🟢 Optimistic update
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.product._id === productId ? { ...ci, quantity: newQty } : ci
      )
    );

    try {
      await updateCartQuantity(productId, newQty);
      window.dispatchEvent(new Event("update-cart-count"));
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      toast.error("❌ Failed to update quantity");
      // 🔄 fallback refetch to sync
      fetchCart();
    }
  };

  // 🗑️ REMOVE HANDLER (optimistic)
  const handleRemove = async (itemId) => {
    // backup current state
    const prevItems = [...cartItems];

    // 🟢 instant remove from UI
    setCartItems((prev) => prev.filter((item) => item._id !== itemId));

    try {
      await removeFromCart(itemId);
      toast.success("Item removed from your cart", {
        icon: "🗑️",
        style: {
          border: "1px solid #e5e7eb",
          padding: "10px 14px",
          fontSize: "14px",
        },
      });
      window.dispatchEvent(new Event("update-cart-count"));
      window.dispatchEvent(new Event("refresh-notifications"));
    } catch (err) {
      // ❌ revert on failure
      setCartItems(prevItems);
      toast.error("❌ Failed to remove item", {
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fecaca",
        },
      });
    }
  };

  // 💫 simple skeleton while loading
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-5 flex gap-4 animate-pulse"
        >
          <div className="w-24 h-24 bg-gray-200 rounded-xl" />
          <div className="flex-1 space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-4 w-52 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* BREADCRUMB BAR */}
      <div className="bg-[#f8f4ee] py-4 border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-center items-center gap-2 text-sm text-gray-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 20v-6h4v6h5v-8h3L10 0 2 12h3v8z" />
            </svg>
            <Link to="/" className="underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">
              Your Shopping Cart
            </span>
          </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">
            Shopping Cart
          </h1>
          {cartItems.length > 0 && !loading && (
            <p className="text-sm text-gray-500">
              You have{" "}
              <span className="font-semibold">{cartItems.length}</span>{" "}
              item{cartItems.length > 1 ? "s" : ""} in your cart
            </p>
          )}
        </div>

        {loading ? (
          renderSkeleton()
        ) : cartItems.length === 0 ? (
          <div className="text-center text-gray-600 py-20">
            <p className="text-lg mb-4">Your cart is empty.</p>
            <button
              onClick={() => navigate("/products")}
              className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#111827] text-white text-sm font-semibold tracking-[0.18em] uppercase hover:bg-black"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2.2fr)_minmax(260px,0.8fr)] gap-8">
            {/* LEFT: CART ITEMS */}
            <div>
              {/* Header row (desktop) */}
              <div className="hidden md:grid grid-cols-[minmax(0,2fr)_minmax(120px,0.6fr)_minmax(140px,0.7fr)_minmax(120px,0.7fr)] text-xs font-semibold text-gray-500 uppercase tracking-[0.18em] mb-3 px-2">
                <span>Product</span>
                <span className="text-center">Price</span>
                <span className="text-center">Quantity</span>
                <span className="text-right">Total</span>
              </div>

              {/* Item cards */}
              {cartItems.map((item) => {
                const p = item.product;
                return (
                  <div
                    key={item._id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 px-3 py-4 md:px-4 md:py-5 mb-4 flex flex-col md:grid md:grid-cols-[minmax(0,2fr)_minmax(120px,0.6fr)_minmax(140px,0.7fr)_minmax(120px,0.7fr)] gap-4 md:items-center"
                  >
                    {/* PRODUCT INFO */}
                    <div className="flex gap-4 items-center">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-[#f9fafb] border border-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                        <img
                          src={getProductImage(p)}
                          alt={p?.name || "Product"}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-[0.22em] text-[#e7425a] mb-1">
                          {p?.category || "Product"}
                        </span>
                        <p className="text-sm md:text-base font-semibold text-gray-900">
                          {p?.name || "Unnamed product"}
                        </p>
                        {p?.brand && (
                          <p className="text-xs uppercase tracking-[0.18em] text-gray-400 mt-1">
                            {p.brand}
                          </p>
                        )}
                        {typeof p?.stock === "number" && (
                          <p className="text-xs text-gray-500 mt-1">
                            Availability:{" "}
                            <span className="font-medium">
                              {p.stock} in stock
                            </span>
                          </p>
                        )}
                        {/* Mobile price & remove */}
                        <div className="flex md:hidden items-center justify-between mt-2">
                          <p className="text-sm font-semibold text-gray-900">
                            Rs. {p?.price?.toFixed(2) || "0.00"}
                          </p>
                          <button
                            onClick={() => handleRemove(item._id)}
                            className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-full text-[11px] text-gray-500 bg-white hover:border-red-400 hover:text-teal-700 shadow-sm"
                          >
                            <FaTrash className="text-[10px]" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* PRICE (desktop) */}
                    <div className="hidden md:flex justify-center">
                      <span className="text-sm font-medium text-gray-900">
                        Rs. {p?.price?.toFixed(2) || "0.00"}
                      </span>
                    </div>

                    {/* QUANTITY */}
                    <div className="flex md:justify-center">
                      <div className="inline-flex items-center rounded-full border border-gray-300 overflow-hidden text-sm bg-white">
                        <button
                          onClick={() => handleQuantity(p._id, "dec")}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={item.quantity <= 1}
                        >
                          <FaMinus size={10} />
                        </button>
                        <span className="px-4 py-1.5 font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantity(p._id, "inc")}
                          className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={
                            typeof p?.stock === "number" &&
                            item.quantity >= p.stock
                          }
                        >
                          <FaPlus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* TOTAL + REMOVE (desktop) */}
                    <div className="hidden md:flex flex-col items-end">
                      <span className="text-sm font-semibold text-gray-900">
                        Rs. {(item.quantity * (p?.price || 0)).toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="mt-2 inline-flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-full text-[11px] text-gray-500 bg-white hover:border-red-400 hover:text-teal-700 shadow-sm"
                      >
                        <FaTrash className="text-[10px]" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="mt-4">
                <button
                  onClick={() => navigate("/products")}
                  className="inline-flex items-center text-xs md:text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  ← Continue shopping
                </button>
              </div>
            </div>

            {/* RIGHT: SUMMARY CARD */}
            <aside>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-28">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>

                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>Rs. {total.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm text-gray-600 mb-4">
                  <span>Shipping</span>
                  <span className="text-gray-400">Calculated at checkout</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-1 mb-4 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    Rs. {total.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-[#111827] hover:bg-black text-white text-xs font-semibold tracking-[0.2em] uppercase rounded-full py-3 mb-3"
                >
                  Proceed to Checkout
                </button>

                <p className="text-[11px] text-gray-500 leading-relaxed">
                  By placing your order, you agree to our{" "}
                  <span className="underline cursor-pointer">
                    Terms &amp; Conditions
                  </span>{" "}
                  and{" "}
                  <span className="underline cursor-pointer">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
};

export default CartPage;

