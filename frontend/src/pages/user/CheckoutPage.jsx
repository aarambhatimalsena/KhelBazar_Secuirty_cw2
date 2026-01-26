import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { placeOrder, simulatePaymentSuccess } from "../../services/orderService";
import { getCart } from "../../services/cartService";
import {
  FiArrowLeft,
  FiPhone,
  FiMapPin,
  FiTag,
  FiShield,
  FiTruck,
  FiHome,
} from "react-icons/fi";

import eSewaLogo from "../../assets/esewa.png";
import khaltiLogo from "../../assets/khalti.png";
import codLogo from "../../assets/cod.png";

// coupon service
import { applyCoupon } from "../../services/couponService";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [subTotal, setSubTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // coupon state
  const [couponInfo, setCouponInfo] = useState(null); // { code, ... }
  const [discountAmount, setDiscountAmount] = useState(0);

  // eSewa modal state
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [esewaNumber, setEsewaNumber] = useState("");
  const [esewaPin, setEsewaPin] = useState("");
  const [esewaError, setEsewaError] = useState("");
  const [esewaValidating, setEsewaValidating] = useState(false);
  const [esewaShake, setEsewaShake] = useState(false);

  // Khalti modal state
  const [showKhaltiModal, setShowKhaltiModal] = useState(false);
  const [khaltiId, setKhaltiId] = useState("");
  const [khaltiPin, setKhaltiPin] = useState("");
  const [khaltiError, setKhaltiError] = useState("");
  const [khaltiValidating, setKhaltiValidating] = useState(false);
  const [khaltiShake, setKhaltiShake] = useState(false);

  // Success overlay
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMethod, setSuccessMethod] = useState("");

  const getCookie = (name) => {
    const match = document.cookie.match(
      new RegExp(`(?:^|;\\s*)${name}=([^;]+)`)
    );
    return match ? decodeURIComponent(match[1]) : "";
  };

  const logCheckoutState = (label) => {
    console.log(`[Checkout Debug] ${label}`, {
      cartItemsCount: cartItems.length,
      shippingAddress: address,
      phone: phoneNumber,
      paymentMethod,
      userId: cartItems[0]?.user?._id || null,
      csrfToken: getCookie("csrfToken") || null,
    });
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cart = await getCart();
        const items = cart.items || [];
        const computed =
          cart.subtotal && cart.subtotal > 0
            ? cart.subtotal
            : items.reduce(
                (sum, item) =>
                  sum +
                  (item.product?.price || 0) * (item.quantity || 0),
                0
              );

        setCartItems(items);
        setSubTotal(computed);
      } catch (error) {
        toast.error("Failed to load cart items", {
          icon: "❌",
          style: {
            backgroundColor: "#fee2e2",
            color: "#b91c1c",
            border: "1px solid #fca5a5",
          },
        });
        console.error("Cart fetch error:", error);
      }
    };
    fetchCart();
  }, []);

  // always have a correct subtotal based on items
  const displaySubtotal =
    subTotal && subTotal > 0
      ? subTotal
      : cartItems.reduce(
          (sum, item) =>
            sum + (item.product?.price || 0) * (item.quantity || 0),
          0
        );

  // final total after discount (front-end preview)
  const finalTotal = Math.max(displaySubtotal - discountAmount, 0);

  const validateBasics = () => {
    if (!phoneNumber) {
      logCheckoutState("Validation failed: missing phone");
      toast.error("Phone number is required", {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
      return false;
    }
    if (!address) {
      logCheckoutState("Validation failed: missing address");
      toast.error("Delivery address is required", {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
      return false;
    }
    if (cartItems.length === 0) {
      logCheckoutState("Validation failed: empty cart");
      toast.error("Your cart is empty", {
        icon: "🛒",
        style: {
          backgroundColor: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        },
      });
      return false;
    }
    return true;
  };

  // MAIN BUTTON CLICK
  const handlePrimaryAction = () => {
    logCheckoutState("Primary action clicked");
    if (!validateBasics()) return;

    if (paymentMethod === "eSewa") {
      logCheckoutState("Opening eSewa modal");
      if (!esewaNumber && phoneNumber) setEsewaNumber(phoneNumber);
      setEsewaError("");
      setShowEsewaModal(true);
      return;
    }

    if (paymentMethod === "Khalti") {
      logCheckoutState("Opening Khalti modal");
      if (!khaltiId && phoneNumber) setKhaltiId(phoneNumber);
      setKhaltiError("");
      setShowKhaltiModal(true);
      return;
    }

    // COD -> direct place order
    handlePlaceOrder();
  };

  // ✅ wait for backend, only show success if API works
  const handlePlaceOrder = async (extraData = {}) => {
    if (loading) {
      logCheckoutState("Place order ignored: already loading");
      return;
    }

    setLoading(true);
    const method = paymentMethod;

    const orderData = {
      phone: phoneNumber,
      deliveryAddress: address,
      paymentMethod: method,
      couponCode: couponCode || null,
      ...extraData,
    };

    try {
      logCheckoutState("Placing order (before API call)");
      const res = await placeOrder(orderData);

      if (method !== "COD" && res?.orderId) {
        await simulatePaymentSuccess({ orderId: res.orderId });
      }

      toast.success("Order placed successfully", {
        icon: "✅",
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        },
      });

      // 🧹 clear local cart UI (backend cart already cleared)
      setCartItems([]);
      setSubTotal(0);
      setCouponInfo(null);
      setDiscountAmount(0);
      setCouponCode("");

      // 🔔 refresh notifications + cart badge
      window.dispatchEvent(new Event("refresh-notifications"));
      window.dispatchEvent(new Event("update-cart-count"));

      // show success overlay + redirect only on success
      setSuccessMethod(method);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        navigate("/checkout-success");
      }, 1000);
    } catch (error) {
      const status = error?.response?.status;
      console.error("Order placement failed:", {
        status,
        data: error?.response?.data,
        message: error?.message,
      });

      const data = error?.response?.data;
      const msg =
        data?.message ||
        (Array.isArray(data?.errors) && data.errors[0]?.msg) ||
        "Failed to place order. Please check your details and try again.";

      toast.error(msg, {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  // eSewa pay submit – with invalid PIN logic (correct: 1234)
  const handleEsewaPay = () => {
    if (!esewaNumber || !esewaPin) {
      return toast.error("Please enter eSewa mobile and PIN", {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
    }

    setEsewaError("");
    setEsewaShake(false);
    setEsewaValidating(true);

    // simulate real gateway validation
    setTimeout(() => {
      if (esewaPin === "1234") {
        setEsewaValidating(false);
        setShowEsewaModal(false);
        setEsewaPin("");
        handlePlaceOrder({
          esewaNumber,
          esewaPin,
        });
      } else {
        setEsewaValidating(false);
        setEsewaError("Incorrect PIN. Please try again.");
        setEsewaShake(true);
        setTimeout(() => setEsewaShake(false), 400);
      }
    }, 900);
  };

  // Khalti pay submit – with invalid PIN logic (correct: 1234)
  const handleKhaltiPay = () => {
    if (!khaltiId || !khaltiPin) {
      return toast.error("Please enter Khalti ID and PIN/OTP", {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
    }

    setKhaltiError("");
    setKhaltiShake(false);
    setKhaltiValidating(true);

    setTimeout(() => {
      if (khaltiPin === "1234") {
        setKhaltiValidating(false);
        setShowKhaltiModal(false);
        setKhaltiPin("");
        handlePlaceOrder({
          khaltiId,
          khaltiPin,
        });
      } else {
        setKhaltiValidating(false);
        setKhaltiError("Incorrect PIN. Please try again.");
        setKhaltiShake(true);
        setTimeout(() => setKhaltiShake(false), 400);
      }
    }, 900);
  };

  const totalItems = cartItems.reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const getPlaceOrderLabel = () => {
    if (cartItems.length === 0) return "No Items in Cart";
    if (paymentMethod === "eSewa") return "Continue to eSewa Payment";
    if (paymentMethod === "Khalti") return "Continue to Khalti Payment";
    return "Place Order Securely";
  };

  const getPlaceOrderButtonClass = () => {
    if (loading || cartItems.length === 0) {
      return "bg-gray-300 text-gray-600 cursor-not-allowed";
    }
    if (paymentMethod === "eSewa") {
      return "bg-green-600 hover:bg-green-700 text-white shadow-sm";
    }
    if (paymentMethod === "Khalti") {
      return "bg-purple-600 hover:bg-purple-700 text-white shadow-sm";
    }
    return "bg-teal-600 hover:bg-teal-700 text-white shadow-sm";
  };

  // Payment details content based on selected method
  const paymentDetails =
    paymentMethod === "COD"
      ? {
          title: "Pay with Cash on Delivery",
          subtitle: "Keep the exact amount ready at your doorstep.",
          bullets: [
            "Pay directly to the delivery rider.",
            "No online transaction required.",
            "Kindly check the package before paying.",
          ],
          badge: "Recommended if you are unsure about online payments.",
        }
      : paymentMethod === "eSewa"
      ? {
          title: "Pay via eSewa Wallet",
          subtitle: "Fast and secure digital payment from your eSewa account.",
          bullets: [
            "You will confirm payment inside the eSewa popup.",
            "Ensure your eSewa wallet has enough balance.",
            "Use your registered mobile number for this order.",
          ],
          badge: "Instant confirmation & no extra charges.",
        }
      : {
          title: "Pay via Khalti Wallet / Card",
          subtitle:
            "Use your Khalti balance or linked card for secure checkout.",
          bullets: [
            "You will confirm payment using Khalti PIN or OTP.",
            "Supports wallet, linked bank accounts and cards.",
            "Do not share your Khalti PIN with anyone.",
          ],
          badge: "Secure payment with real-time status.",
        };

  // COUPON APPLY HANDLER
  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      return toast("Enter a coupon code first", {
        icon: "🏷️",
        style: {
          backgroundColor: "#fef3c7",
          color: "#92400e",
          border: "1px solid #fcd34d",
        },
      });
    }

    try {
      const res = await applyCoupon(code, displaySubtotal);

      setCouponInfo(res.coupon || { code });
      setDiscountAmount(res.discountAmount || 0);

      toast.success(`Coupon ${code.toUpperCase()} applied successfully`, {
        icon: "✅",
        style: {
          backgroundColor: "#dcfce7",
          color: "#166534",
          border: "1px solid #86efac",
        },
      });
    } catch (error) {
      console.error("Coupon apply failed", error);
      setCouponInfo(null);
      setDiscountAmount(0);

      const msg =
        error?.response?.data?.message ||
        "Invalid or expired coupon. Please try another one.";

      toast.error(msg, {
        icon: "❌",
        style: {
          backgroundColor: "#fee2e2",
          color: "#b91c1c",
          border: "1px solid #fca5a5",
        },
      });
    }
  };

  // COUPON REMOVE HANDLER
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponInfo(null);
    setDiscountAmount(0);

    toast("Coupon removed", {
      icon: "✂️",
      style: {
        backgroundColor: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
      },
    });
  };

  return (
    <>
      {/* PAGE BACKGROUND + BREADCRUMB STRIP */}
      <div className="min-h-screen bg-slate-50 pt-0 pb-10">
        {/* Breadcrumb bar */}
        <div className="bg-[#f7f2eb] border-y border-gray-200 mb-6">
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between text-xs md:text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <FiHome className="w-4 h-4" />
              <Link to="/" className="hover:underline hover:text-gray-900">
                Home
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/cart" className="hover:underline hover:text-gray-900">
                Cart
              </Link>
              <span className="text-gray-400">/</span>
              <span className="font-semibold text-gray-900">Checkout</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] text-gray-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Secure checkout powered by KhelBazar</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Top breadcrumb / back / label */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Link
                to="/cart"
                className="flex items-center gap-1 hover:text-teal-600"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Cart
              </Link>
            </div>
            <p className="text-xs md:text-sm text-gray-400 uppercase tracking-wide">
              Secure Checkout
            </p>
          </div>

          {/* Title + shield pill */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                Checkout
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Review your details and confirm your order. Your court-ready gear
                is almost yours. 🏀
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
              <span className="px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-700 flex items-center gap-2">
                <FiShield className="w-4 h-4" />
                100% Secure Checkout
              </span>
            </div>
          </div>

          {/* Main layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact & Address */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-xs font-semibold text-teal-600">
                    1
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                      Contact & Delivery Details
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      We&apos;ll use this to deliver your order and contact you if
                      needed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-1 mb-1 text-xs font-medium text-gray-700 uppercase tracking-wide">
                      <FiPhone className="w-4 h-4" />
                      Phone Number
                      <span className="text-teal-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50"
                      placeholder="98XXXXXXXX"
                    />
                  </div>

                  {/* Address */}
                  <div className="md:col-span-1">
                    <label className="flex items-center gap-1 mb-1 text-xs font-medium text-gray-700 uppercase tracking-wide">
                      <FiMapPin className="w-4 h-4" />
                      Delivery Address
                      <span className="text-teal-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50 resize-none"
                      placeholder="House / Street, Area, City"
                    />
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                  <FiTruck className="w-4 h-4" />
                  <span>
                    Standard delivery within 2–5 working days in major cities.
                  </span>
                </div>
              </div>

              {/* Payment method + details */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-xs font-semibold text-teal-600">
                    2
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-gray-900">
                      Payment & Billing
                    </h2>
                    <p className="text-xs md:text-sm text-gray-500">
                      Select your preferred payment option and review how the
                      payment will be processed.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-[1.4fr,1fr] gap-5">
                  {/* LEFT – methods list */}
                  <div className="space-y-3">
                    {/* COD */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("COD")}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        paymentMethod === "COD"
                          ? "border-teal-500 bg-teal-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border mr-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            paymentMethod === "COD"
                              ? "bg-teal-500"
                              : "bg-transparent"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            Cash on Delivery
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Popular
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pay the rider in cash when your order arrives.
                        </p>
                      </div>
                      <img src={codLogo} alt="COD" className="w-8 h-auto" />
                    </button>

                    {/* eSewa */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("eSewa")}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        paymentMethod === "eSewa"
                          ? "border-green-500 bg-green-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border mr-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            paymentMethod === "eSewa"
                              ? "bg-green-500"
                              : "bg-transparent"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            eSewa Wallet
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-800 border border-green-300">
                            Wallet
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Instant payment using your eSewa balance.
                        </p>
                      </div>
                      <img src={eSewaLogo} alt="eSewa" className="w-10 h-auto" />
                    </button>

                    {/* Khalti */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Khalti")}
                      className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all ${
                        paymentMethod === "Khalti"
                          ? "border-purple-500 bg-purple-50 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full border mr-1">
                        <span
                          className={`w-3 h-3 rounded-full ${
                            paymentMethod === "Khalti"
                              ? "bg-purple-600"
                              : "bg-transparent"
                          }`}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">
                            Khalti Wallet / Card
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                            Wallet / Card
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Pay via Khalti balance, bank, or linked card.
                        </p>
                      </div>
                      <img
                        src={khaltiLogo}
                        alt="Khalti"
                        className="w-10 h-auto"
                      />
                    </button>
                  </div>

                  {/* RIGHT – payment details panel */}
                  <div className="rounded-2xl border border-gray-100 bg-[#f9f6f1] px-4 py-4 text-sm">
                    <p className="text-xs font-semibold tracking-[0.15em] uppercase text-gray-500 mb-1">
                      Payment Details
                    </p>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {paymentDetails.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">
                      {paymentDetails.subtitle}
                    </p>

                    <ul className="space-y-1.5 mb-3">
                      {paymentDetails.bullets.map((b, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-gray-700"
                        >
                          <span className="mt-1 w-1.5 h-1.5 rounded-full bg-gray-400" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-1 rounded-lg bg-white/70 border border-dashed border-gray-300 px-3 py-2 text-[11px] text-gray-600">
                      {paymentDetails.badge}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500">
                  <FiShield className="w-4 h-4" />
                  <span>Your payment details are encrypted and protected.</span>
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FiTag className="w-4 h-4 text-teal-500" />
                  <h2 className="text-sm font-semibold text-gray-900">
                    Have a coupon?
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-slate-50"
                    placeholder="Enter coupon code"
                  />
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl border border-teal-500 text-teal-600 text-sm font-medium hover:bg-teal-50 transition"
                    onClick={handleApplyCoupon}
                  >
                    Apply
                  </button>
                </div>

                {/* applied coupon info + remove */}
                {discountAmount > 0 && couponInfo?.code && (
                  <div className="mt-2 flex items-center justify-between text-[11px] md:text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-emerald-800">
                    <span>
                      Coupon{" "}
                      <span className="font-semibold">
                        {couponInfo.code.toUpperCase()}
                      </span>{" "}
                      applied. You saved Rs. {discountAmount}.
                    </span>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="ml-3 text-[11px] font-semibold underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <p className="mt-2 text-[11px] text-gray-500">
                  Any eligible discount will be calculated on the server before
                  confirming your order.
                </p>
              </div>
            </div>

            {/* Right: Order summary */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-base font-semibold text-gray-900 mb-3">
                  Order Summary
                </h3>

                {cartItems.length === 0 ? (
                  <p className="text-sm text-gray-500">Your cart is empty.</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {cartItems.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            {item.product?.image?.url && (
                              <img
                                src={item.product.image.url}
                                alt={item.product.name}
                                className="w-12 h-12 rounded-xl object-cover bg-slate-100"
                              />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                {item.product?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm font-semibold text-gray-900">
                            Rs. {item.product?.price * item.quantity}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-500">
                        <span>Items</span>
                        <span>{totalItems}</span>
                      </div>

                      <div className="flex justify-between text-gray-500">
                        <span>Subtotal</span>
                        <span>Rs. {displaySubtotal}</span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-600">
                          <span>
                            Coupon
                            {couponInfo?.code
                              ? ` (${couponInfo.code.toUpperCase()})`
                              : ""}
                          </span>
                          <span>- Rs. {discountAmount}</span>
                        </div>
                      )}

                      <div className="flex justify-between text-gray-400 text-xs">
                        <span>Shipping & discounts</span>
                        <span>Calculated at server</span>
                      </div>

                      <div className="border-t border-dashed border-gray-200 pt-3 mt-2 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          Estimated Total
                        </span>
                        <span className="text-lg font-semibold text-teal-600">
                          Rs. {finalTotal}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Place order button card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <button
                  onClick={handlePrimaryAction}
                  disabled={loading || cartItems.length === 0}
                  className={`w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide uppercase transition ${getPlaceOrderButtonClass()}`}
                >
                  {loading ? "Processing..." : getPlaceOrderLabel()}
                </button>
                <p className="mt-2 text-[11px] text-gray-500 text-center">
                  By placing this order, you agree to KhelBazar&apos;s Terms &amp;
                  Conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* eSewa Modal */}
      {showEsewaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-green-200 p-6 relative">
            <button
              onClick={() => {
                if (esewaValidating || loading) return;
                setShowEsewaModal(false);
                setEsewaError("");
                setEsewaShake(false);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img src={eSewaLogo} alt="eSewa" className="w-16 h-auto" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-green-700 font-semibold">
                  eSewa Wallet Payment
                </p>
                <p className="text-xs text-gray-500">
                  Enter your eSewa details to confirm this payment.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">Amount to pay</span>
              <span className="text-xl font-semibold text-green-700">
                Rs. {finalTotal}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  eSewa Mobile Number
                </label>
                <input
                  type="tel"
                  value={esewaNumber}
                  onChange={(e) => setEsewaNumber(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50"
                  placeholder="98XXXXXXXX"
                />
              </div>

              <div
                className={`transition-transform ${
                  esewaShake ? "shake-strong" : ""
                }`}
              >
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  eSewa PIN
                </label>
                <input
                  type="password"
                  value={esewaPin}
                  onChange={(e) => {
                    setEsewaPin(e.target.value);
                    if (esewaError) setEsewaError("");
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-slate-50 ${
                    esewaError
                      ? "border border-red-500 ring-red-400"
                      : "border border-gray-200 focus:ring-green-500 focus:border-transparent"
                  }`}
                  placeholder="●●●●"
                />
                {esewaError && (
                  <p className="mt-1 text-[11px] text-teal-700">
                    {esewaError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (esewaValidating || loading) return;
                  setShowEsewaModal(false);
                  setEsewaError("");
                  setEsewaShake(false);
                }}
                className="px-4 py-2 text-xs md:text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                disabled={esewaValidating || loading}
              >
                Cancel
              </button>
              <button
                onClick={handleEsewaPay}
                disabled={esewaValidating || loading}
                className="px-4 py-2 text-xs md:text-sm rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm disabled:bg-gray-300 disabled:text-gray-600 flex items-center gap-2"
              >
                {esewaValidating || loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay with eSewa"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Khalti Modal */}
      {showKhaltiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-purple-200 p-6 relative">
            <button
              onClick={() => {
                if (khaltiValidating || loading) return;
                setShowKhaltiModal(false);
                setKhaltiError("");
                setKhaltiShake(false);
              }}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img src={khaltiLogo} alt="Khalti" className="w-16 h-auto" />
              <div>
                <p className="text-[11px] uppercase tracking-wide text-purple-700 font-semibold">
                  Khalti Payment
                </p>
                <p className="text-xs text-gray-500">
                  Pay securely via Khalti wallet or linked card.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">Amount to pay</span>
              <span className="text-xl font-semibold text-purple-700">
                Rs. {finalTotal}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Khalti ID / Mobile
                </label>
                <input
                  type="text"
                  value={khaltiId}
                  onChange={(e) => setKhaltiId(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-slate-50"
                  placeholder="Khalti ID or 98XXXXXXXX"
                />
              </div>

              <div
                className={`transition-transform ${
                  khaltiShake ? "shake-strong" : ""
                }`}
              >
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  PIN / OTP
                </label>
                <input
                  type="password"
                  value={khaltiPin}
                  onChange={(e) => {
                    setKhaltiPin(e.target.value);
                    if (khaltiError) setKhaltiError("");
                  }}
                  className={`w-full rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 bg-slate-50 ${
                    khaltiError
                      ? "border border-red-500 ring-red-400"
                      : "border border-gray-200 focus:ring-purple-500 focus:border-transparent"
                  }`}
                  placeholder="●●●●"
                />
                {khaltiError && (
                  <p className="mt-1 text-[11px] text-teal-700">
                    {khaltiError}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  if (khaltiValidating || loading) return;
                  setShowKhaltiModal(false);
                  setKhaltiError("");
                  setKhaltiShake(false);
                }}
                className="px-4 py-2 text-xs md:text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
                disabled={khaltiValidating || loading}
              >
                Cancel
              </button>
              <button
                onClick={handleKhaltiPay}
                disabled={khaltiValidating || loading}
                className="px-4 py-2 text-xs md:text-sm rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-sm disabled:bg-gray-300 disabled:text-gray-600 flex items-center gap-2"
              >
                {khaltiValidating || loading ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Pay with Khalti"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global success overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl px-8 py-10 max-w-sm w-full text-center shadow-2xl">
            <div className="relative mx-auto mb-5">
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold">
                  ✓
                </div>
              </div>
              <span className="absolute inset-0 w-24 h-24 rounded-full border-2 border-green-300 animate-ping opacity-40 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Payment Successful
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              Your order is being confirmed. You&apos;ll be redirected shortly.
            </p>
            <p className="text-xs text-gray-400">
              Method:{" "}
              {successMethod === "COD"
                ? "Cash on Delivery"
                : successMethod || "Processing"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutPage;


