import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getOrderById } from "../../services/orderService";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaArrowLeft,
} from "react-icons/fa";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Loading order…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (!order) return null;

  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleString()
    : "-";
  const updatedAt = order.updatedAt
    ? new Date(order.updatedAt).toLocaleString()
    : "-";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-4xl mx-auto px-4 lg:px-0 py-10">
        {/* CARD */}
        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[#2563eb] via-[#4f46e5] to-[#22c55e]" />

          <div className="p-6 sm:p-8 space-y-6">
            {/* HEADER ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-semibold">
                  ADMIN · ORDER DETAIL
                </p>
                <h2 className="text-2xl font-semibold text-gray-900 mt-1">
                  Order <span className="text-[#2563eb]">#{order._id}</span>
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Placed on {createdAt}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                {/* Status pill */}
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Status:{" "}
                  <span className="ml-1 text-gray-900">{order.status}</span>
                </span>

                {/* Paid pill */}
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    order.isPaid
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {order.isPaid ? (
                    <FaCheckCircle className="mr-1.5" />
                  ) : (
                    <FaTimesCircle className="mr-1.5" />
                  )}
                  {order.isPaid ? "Paid" : "Not Paid"}
                </span>

                {/* Integrity hint */}
                {order.integrityHash && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-slate-900 text-white">
                    <FaShieldAlt className="mr-1.5" />
                    Integrity Protected
                  </span>
                )}

                <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border border-gray-300 bg-white hover:bg-gray-50 text-gray-700"
                >
                  <FaArrowLeft className="mr-1.5" />
                  Back
                </button>
              </div>
            </div>

            {/* SUMMARY GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50/60 rounded-2xl p-4">
              <div>
                <p className="font-semibold text-gray-800">Customer</p>
                <p>
                  {order.user?.name}{" "}
                  {order.user?.email && (
                    <span className="text-gray-500">({order.user.email})</span>
                  )}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Payment Method</p>
                <p>{order.paymentMethod || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Total Amount</p>
                <p>
                  NPR {order.totalAmount?.toLocaleString("en-IN") ?? "0"}
                </p>
                {order.discount > 0 && (
                  <p className="text-xs text-emerald-600">
                    Discount: NPR {order.discount.toLocaleString("en-IN")}{" "}
                    {order.couponCode && <>({order.couponCode})</>}
                  </p>
                )}
              </div>
              <div>
                <p className="font-semibold text-gray-800">Delivery Address</p>
                <p className="text-gray-700">{order.deliveryAddress}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Phone: {order.phone}
                </p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Created</p>
                <p>{createdAt}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-800">Last Updated</p>
                <p>{updatedAt}</p>
              </div>
            </div>

            {/* ITEMS LIST */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item._id}
                    className="border border-gray-100 bg-white rounded-2xl p-3 sm:p-4 flex items-center gap-4"
                  >
                    <img
                      src={item.product?.image || "/no-image.png"}
                      alt={item.product?.name || "Deleted Product"}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-50 border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {item.product?.name || (
                          <span className="text-red-500 italic">
                            Deleted Product
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} × NPR{" "}
                        {item.price?.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="font-semibold text-gray-900">
                      NPR{" "}
                      {(item.price * item.quantity)?.toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FOOTER NOTE */}
            {order.createdIp && (
              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                Security note: order created from IP{" "}
                <span className="font-mono">{order.createdIp}</span>{" "}
                {order.createdUserAgent && (
                  <>
                    using{" "}
                    <span className="font-mono">
                      {order.createdUserAgent}
                    </span>
                  </>
                )}
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
