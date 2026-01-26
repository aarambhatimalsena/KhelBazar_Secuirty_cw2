// src/pages/user/CheckoutSuccessPage.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiHome, FiShoppingBag, FiArrowRight } from "react-icons/fi";

const CheckoutSuccessPage = () => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // 👇 yo le page load huda sadhai top bata dekhauncha
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // "smooth" chai mild animation chahiyo bhane
    });

    const timer = setTimeout(() => setAnimate(true), 100); // smooth entry animation
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col items-center justify-center px-4 py-16">
      {/* Success Animation */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center text-5xl font-bold">
            ✓
          </div>
        </div>

        {/* Pulsing Ring */}
        <span className="absolute inset-0 w-32 h-32 rounded-full border-2 border-green-400 animate-ping opacity-40"></span>
      </div>

      {/* Text Section */}
      <h1
        className={`text-3xl md:text-4xl font-semibold text-gray-900 transition-all duration-700 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        Thank You! Your Order is Confirmed 🎉
      </h1>

      <p
        className={`text-gray-600 max-w-lg text-sm md:text-base mt-3 mb-8 transition-all duration-700 delay-150 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        Your order has been placed successfully. You will receive an invoice and
        delivery updates shortly. Enjoy your new basketball gear from{" "}
        <span className="font-semibold text-teal-600">KhelBazar</span> 🏀
      </p>

      {/* Buttons Section */}
      <div
        className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-300 ${
          animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        <Link
          to="/orders"
          className="px-6 py-3 rounded-xl bg-teal-600 text-white font-medium shadow hover:bg-teal-700 transition flex items-center gap-2"
        >
          <FiShoppingBag size={18} />
          View My Orders
        </Link>

        <Link
          to="/products"
          className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition flex items-center gap-2"
        >
          <FiArrowRight size={18} />
          Continue Shopping
        </Link>
      </div>

      {/* Back Home Link */}
      <Link
        to="/"
        className="mt-10 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
      >
        <FiHome size={16} />
        Back to Home
      </Link>
    </div>
  );
};

export default CheckoutSuccessPage;

