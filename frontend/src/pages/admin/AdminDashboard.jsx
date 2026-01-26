// src/pages/admin/AdminDashboard.jsx
import React from "react";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaRupeeSign,
  FaTags,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ProductTable from "../../components/admin/ProductTable";
import useAdminStats from "../../hooks/useAdminStats";

const AdminDashboard = () => {
  const { data: stats = {}, isLoading, isError } = useAdminStats();
  const navigate = useNavigate();

  const totalProducts = stats.totalProducts || 0;
  const totalUsers = stats.totalUsers || 0;
  const totalOrders = stats.totalOrders || 0;
  const totalSales = stats.totalSales || 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <p className="text-sm text-gray-500">
          Loading your admin experience…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <p className="text-sm text-red-500">
          Failed to load stats. Please refresh and try again.
        </p>
      </div>
    );
  }

  const tabs = [
    { label: "Products", path: "/admin/products" },
    { label: "Categories", path: "/admin/categories" },
    { label: "Orders", path: "/admin/orders" },
    { label: "Reviews", path: "/admin/reviews" },
    { label: "Coupons", path: "/admin/coupons" },
    { label: "Users", path: "/admin/users" },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-8 space-y-8">
        {/* ================= TOP HEADER ================= */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <p className="text-[11px] tracking-[0.3em] font-semibold text-red-500 uppercase">
              KhelBazar · ADMIN
            </p>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mt-1">
              Store <span className="text-[#0f6b6f]">Control Center</span>
            </h1>
            <p className="text-sm text-gray-500 mt-2 max-w-xl">
              Monitor products, orders and users in a clean admin panel that
              matches your storefront experience.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 justify-start sm:justify-end">
            <div className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Store status: <span className="font-semibold">Live</span>
            </div>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 text-xs sm:text-sm font-medium rounded-full border border-gray-300 bg-white text-gray-800 hover:border-[#0f6b6f] hover:text-[#0f6b6f] transition"
            >
              View Storefront
            </button>
            <button
              onClick={() => navigate("/admin/products/add")}
              className="px-5 py-2.5 text-xs sm:text-sm font-medium rounded-full bg-[#0f6b6f] text-white shadow-sm hover:bg-[#0b5559] transition"
            >
              + Add Product
            </button>
          </div>
        </header>

        {/* ================= HERO + SNAPSHOT ================= */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: HERO CARD */}
          <div className="lg:col-span-2">
            <div className="relative rounded-3xl overflow-hidden border border-gray-100 bg-white/95 shadow-[0_18px_45px_rgba(0,0,0,0.06)]">
              <div className="h-1 w-full bg-gradient-to-r from-[#0f6b6f] via-[#ff6b81] to-orange-300" />
              <div className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                {/* TEXT SIDE */}
                <div className="space-y-3 max-w-xl">
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                    Stay on top of{" "}
                    <span className="text-[#0f6b6f]">every bounce.</span>
                  </h2>
                  <p className="text-sm text-gray-600">
                    Track inventory, revenue and user activity with a dashboard
                    that feels connected to your shopping homepage.
                  </p>

                  <p className="text-xs sm:text-sm text-gray-500">
                    Managing{" "}
                    <span className="font-semibold text-gray-900">
                      {totalProducts.toLocaleString()} products
                    </span>
                    ,{" "}
                    <span className="font-semibold text-gray-900">
                      {totalOrders.toLocaleString()} orders
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold text-gray-900">
                      {totalUsers.toLocaleString()} users
                    </span>{" "}
                    across KhelBazar.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-1.5">
                    <button
                      onClick={() => navigate("/admin/orders")}
                      className="px-4 py-2 text-xs sm:text-sm rounded-full bg-black text-white hover:bg-neutral-800 transition"
                    >
                      View Orders
                    </button>
                    <button
                      onClick={() => navigate("/admin/coupons")}
                      className="px-4 py-2 text-xs sm:text-sm rounded-full border border-gray-300 bg-white text-gray-800 hover:border-[#0f6b6f] hover:text-[#0f6b6f] transition"
                    >
                      Manage Coupons
                    </button>
                  </div>
                </div>

                {/* VISUAL SIDE */}
                <div className="flex justify-center md:justify-end">
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48">
                    <div className="absolute inset-0 rounded-full bg-[#f7f7f8] border border-gray-200" />
                    <div className="absolute inset-3 rounded-full bg-black flex items-center justify-center">
                      <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white">
                        ADMIN
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-1 sm:-right-3 px-3 py-1 rounded-full bg-white shadow text-[10px] font-medium text-gray-700">
                      Dashboard
                    </div>
                    <div className="absolute -top-2 -left-3 px-2.5 py-1 rounded-full bg-[#0f6b6f] text-[10px] text-white shadow">
                      Live Data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: SNAPSHOT CARD */}
          <div className="bg-white/95 border border-gray-100 rounded-3xl shadow-sm p-5 flex flex-col justify-between">
            <div>
              <p className="text-[11px] tracking-[0.2em] font-semibold text-gray-500 uppercase mb-2">
                Today&apos;s Snapshot
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Key numbers pulled from your latest store activity.
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Total Revenue</span>
                  <span className="font-semibold text-gray-900">
                    NPR {totalSales.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Orders</span>
                  <span className="font-semibold text-gray-900">
                    {totalOrders.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Products Live</span>
                  <span className="font-semibold text-gray-900">
                    {totalProducts.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Registered Users</span>
                  <span className="font-semibold text-gray-900">
                    {totalUsers.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-500">
              Keep stock, pricing and offers consistent with what your customers
              see on the storefront.
            </div>
          </div>
        </section>

        {/* ================= KPI STRIP ================= */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0f6b6f]/10 flex items-center justify-center">
              <FaBox className="text-[#0f6b6f] text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Products</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalProducts.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
              <FaUsers className="text-amber-500 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Users</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalUsers.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
              <FaShoppingCart className="text-rose-500 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Orders</p>
              <p className="text-lg font-semibold text-gray-900">
                {totalOrders.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <FaRupeeSign className="text-emerald-500 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                NPR {totalSales.toLocaleString()}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/coupons")}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 text-left hover:border-[#0f6b6f] hover:bg-[#fff5f6] transition"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500/10 flex items-center justify-center">
              <FaTags className="text-sky-500 text-lg" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Coupons</p>
              <p className="text-sm font-semibold text-gray-900">
                Manage &amp; Create
              </p>
            </div>
          </button>
        </section>

        {/* ================= NAV TABS ================= */}
        <section className="flex flex-wrap gap-3 border-b border-gray-100 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className="px-4 py-2 text-xs sm:text-sm rounded-full border border-gray-200 bg-white text-gray-700 hover:border-[#0f6b6f] hover:text-[#0f6b6f] transition"
            >
              {tab.label}
            </button>
          ))}
        </section>

        {/* ================= MAIN CONTENT (PRODUCT TABLE) ================= */}
        <section className="bg-white/95 rounded-3xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Products Management
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                View, edit and manage every basketball product on KhelBazar.
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/products/add")}
              className="px-4 py-2 text-xs sm:text-sm rounded-full bg-[#0f6b6f] text-white hover:bg-[#0b5559] transition"
            >
              + Add New Product
            </button>
          </div>

          <ProductTable />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

