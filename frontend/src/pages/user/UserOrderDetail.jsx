// src/pages/user/UserOrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrderByIdUser } from "../../services/orderService";
import { FiHome } from "react-icons/fi";

const UserOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setError(null);
        setLoading(true);

        const data = await getOrderByIdUser(orderId);

        // backend ले { order: {...} } वा direct order दुबै handle
        const orderData = data?.order || data;
        setOrder(orderData || null);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  // ✅ full-page loader (white blank ko sट्टा)
  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-[#f5f1eb]">
        <div className="w-10 h-10 rounded-full border-2 border-gray-300 border-t-red-500 animate-spin mb-3" />
        <p className="text-sm text-gray-600">Loading your order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-500 text-center">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-center">No order found.</p>
      </div>
    );
  }

  // items array safe way
  const items = order.items || order.orderItems || [];

  return (
    <>
      {/* 🔹 Breadcrumb */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700 border-b border-gray-200">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiHome className="inline-block w-4 h-4" />
            <Link to="/" className="hover:underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>

            <Link to="/orders" className="hover:underline hover:text-gray-800">
              My Orders
            </Link>

            <span className="text-gray-400">/</span>

            <span className="font-semibold text-gray-900">
              Order #{String(order._id).slice(-6)}
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="border border-gray-200 rounded-xl bg-white shadow-md p-6">
          {/* HEADER */}
          <h2 className="text-2xl font-semibold mb-6 pb-3 border-b flex items-center gap-2">
            🧾 Order Details
          </h2>

          {/* ORDER SUMMARY */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-800">
            {/* LEFT */}
            <div className="space-y-2">
              <p>
                <strong>Order ID:</strong>{" "}
                <span className="font-mono">{order._id}</span>
              </p>

              <p>
                <strong>Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    order.status === "Processing"
                      ? "bg-yellow-100 text-yellow-700"
                      : order.status === "Delivered"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {order.status}
                </span>
              </p>

              <p>
                <strong>Payment:</strong>{" "}
                <span
                  className={`font-semibold ${
                    order.isPaid ? "text-green-600" : "text-teal-700"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Unpaid"}
                </span>
              </p>

              <p>
                <strong>Payment Method:</strong> {order.paymentMethod}
              </p>
            </div>

            {/* RIGHT */}
            <div className="space-y-2">
              <p>
                <strong>Total Amount:</strong>{" "}
                <span className="font-medium text-gray-900">
                  Rs. {order.totalAmount}
                </span>
              </p>

              {order.discount > 0 && (
                <p>
                  <strong>Discount:</strong> Rs. {order.discount}
                </p>
              )}

              <p>
                <strong>Delivery Address:</strong>{" "}
                <span className="text-gray-700">
                  {order.deliveryAddress}
                </span>
              </p>

              <p>
                <strong>Phone:</strong> {order.phone}
              </p>
            </div>
          </div>

          <hr className="my-6" />

          {/* ORDERED ITEMS */}
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📦 Items Ordered
          </h3>

          <div className="space-y-4">
            {items.map((item) => {
              const productName =
                item.product?.name || item.name || "Product Removed";

              const productImage =
                item.product?.images?.[0]?.url ||
                item.product?.image ||
                "/no-image.png";

              return (
                <div
                  key={item._id}
                  className="flex items-center gap-4 border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                >
                  <img
                    src={productImage}
                    alt={productName}
                    className="w-20 h-20 object-contain bg-white border rounded-lg"
                  />

                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {productName}
                    </p>

                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity} × Rs. {item.price}
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                      Subtotal: Rs. {item.price * item.quantity}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserOrderDetail;

