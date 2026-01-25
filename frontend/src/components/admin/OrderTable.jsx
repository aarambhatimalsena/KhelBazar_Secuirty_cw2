// src/components/admin/OrderTable.jsx
import React from "react";
import { FaDownload, FaCheckCircle } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../api/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateOrderStatus,
  markOrderPaid,
} from "../../services/orderService";
import { useNavigate } from "react-router-dom"; // ⬅️ NEW

const OrderTable = ({ orders }) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate(); // ⬅️ NEW

  const { mutate: updateStatus } = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: () => toast.error("Failed to update status"),
  });

  const { mutate: markPaid } = useMutation({
    mutationFn: markOrderPaid,
    onSuccess: () => {
      toast.success("Order marked as paid");
      queryClient.invalidateQueries(["admin-orders"]);
    },
    onError: () => toast.error("Failed to mark as paid"),
  });

  const handleStatusChange = (orderId, status) => {
    updateStatus({ orderId, status });
  };

  const handleMarkPaid = (orderId) => {
    markPaid({ orderId });
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const res = await api.get(`/orders/invoice/${orderId}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("❌ Failed to download invoice:", err);
      toast.error("Failed to download invoice");
    }
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="max-h-[500px] overflow-y-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Paid</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-800">
                    {order.user?.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.user?.email}
                  </div>
                </td>

                <td className="px-4 py-3 font-semibold">
                  ₹{order.totalAmount?.toLocaleString()}
                </td>

                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order._id, e.target.value)
                    }
                    className="border text-sm px-2 py-1 rounded"
                  >
                    {["Processing", "Shipped", "Delivered", "Cancelled"].map(
                      (status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      )
                    )}
                  </select>
                </td>

                <td className="px-4 py-3">
                  {order.isPaid ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <FaCheckCircle /> Paid
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMarkPaid(order._id)}
                      className="text-red-500 hover:underline text-sm"
                    >
                      Mark as Paid
                    </button>
                  )}
                </td>

                {/* 👉 ACTIONS: View + Invoice */}
                <td className="px-4 py-3 text-right space-x-3 text-xs sm:text-sm">
                  <button
                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                    className="inline-flex items-center gap-1 text-gray-700 hover:text-[#0f6b6f] hover:underline"
                  >
                    View
                  </button>

                  <button
                    onClick={() => handleDownloadInvoice(order._id)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <FaDownload /> Invoice
                  </button>
                </td>
              </tr>
            ))}

            {orders.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;

