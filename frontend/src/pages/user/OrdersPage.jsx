// src/pages/user/OrdersPage.jsx
import React, { useEffect, useState } from "react";
import { getUserOrders, downloadInvoice } from "../../services/orderService";
import { Link } from "react-router-dom";
import { FiDownload, FiHome } from "react-icons/fi";
import { FaBoxOpen } from "react-icons/fa";

const OrdersPage = () => {
  // 🔥 init from cache for instant render
  const [orders, setOrders] = useState(() => {
    try {
      const cached = localStorage.getItem("KhelBazar_orders");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(() => orders.length === 0);
  const [error, setError] = useState("");

  const sortOrders = (list) =>
    [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const syncOrders = (list) => {
    const sorted = sortOrders(list || []);
    setOrders(sorted);
    try {
      localStorage.setItem("KhelBazar_orders", JSON.stringify(sorted));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setError("");
        const data = await getUserOrders();
        syncOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        if (orders.length === 0) {
          setError("Failed to load your orders.");
        }
        // if cache cha, UI tyo bata dekhiri
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await downloadInvoice(orderId);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Invoice download failed", error);
      // optional toast here if you use toast globally
    }
  };

  // 💫 skeleton cards for first load (no cache)
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="border rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify_between items-start md:items-center animate-pulse"
        >
          <div className="space-y-2 w-full md:w-auto">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-28 bg-gray-200 rounded" />
          </div>
          <div className="mt-3 md:mt-0 flex gap-3 w-full md:w-auto justify-end">
            <div className="h-8 w-28 bg-gray-200 rounded" />
            <div className="h-8 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* BREADCRUMB */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiHome className="inline-block w-4 h-4" />
            <Link to="/" className="hover:underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">My Orders</span>
          </div>

          {!loading && !error && (
            <p className="text-xs text-gray-500">
              You have{" "}
              <span className="font-semibold">{orders.length}</span> order
              {orders.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto p-4 min-h-screen">
        <h2 className="text-2xl font-semibold mb-6">My Orders</h2>

        {loading && orders.length === 0 ? (
          renderSkeleton()
        ) : error && orders.length === 0 ? (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        ) : orders.length === 0 ? (
          <div className="text-center text-gray-500">
            <FaBoxOpen className="mx-auto text-5xl mb-2" />
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="border rounded-lg shadow-sm p-4 flex flex-col md:flex-row justify-between items-start md:items-center bg-white"
              >
                <div>
                  <p className="font-medium">
                    Order ID:{" "}
                    <span className="text-gray-700 break-all">
                      {order._id}
                    </span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString()
                      : "-"}
                  </p>
                  <p className="text-sm">
                    Items: {order.items?.length || 0} | Total: Rs.{" "}
                    {Number(order.totalAmount || 0).toFixed(2)}
                  </p>
                  <p className="text-sm">
                    Status:{" "}
                    <span className="capitalize text-blue-600">
                      {order.status || "pending"}
                    </span>
                  </p>
                </div>

                <div className="mt-3 md:mt-0 flex gap-3">
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-sm text-white bg-gray-800 px-3 py-1.5 rounded hover:bg-gray-700"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDownloadInvoice(order._id)}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <FiDownload /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default OrdersPage;
