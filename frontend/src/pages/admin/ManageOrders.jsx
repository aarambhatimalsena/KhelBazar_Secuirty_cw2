import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllOrders } from "../../services/orderService";
import toast from "react-hot-toast";
import OrderTable from "../../components/admin/OrderTable";
import HeaderBox from "../../components/common/HeaderBox";
import { FaClipboardList } from "react-icons/fa";

const ManageOrders = () => {
  const {
    data: orders = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders,
    onError: () => toast.error("Failed to load orders"),
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-6">
        {/* HEADER – same style as ManageProducts / Categories */}
        <HeaderBox
          icon={<FaClipboardList className="text-[#2563eb]" />}
          title="Manage Orders"
          subtitle="Track, update and fulfill customer orders from a single place."
        />

        {/* MAIN CARD */}
        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* top accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#eb2525] via-[#e54646] to-[#c52d22d7]" />

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Order Overview
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Review latest orders, check payment status and manage
                  fulfillment.
                </p>
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-gray-500">Loading orders…</p>
            ) : isError ? (
              <p className="text-sm text-red-500">
                Something went wrong while fetching orders.
              </p>
            ) : (
              <OrderTable orders={orders} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOrders;
