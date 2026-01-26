import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllCoupons, deleteCoupon } from "../../services/couponService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaTrash, FaTags } from "react-icons/fa";
import ConfirmModal from "../../components/common/ConfirmModal";

const ManageCoupons = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCoupon, setSelectedCoupon] = React.useState(null);
  const [showConfirm, setShowConfirm] = React.useState(false);

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: getAllCoupons,
  });

  const { mutate: deleteHandler } = useMutation({
    mutationFn: deleteCoupon,
    onSuccess: () => {
      toast.success("Coupon deleted");
      queryClient.invalidateQueries(["coupons"]);
    },
    onError: () => toast.error("Failed to delete coupon"),
  });

  return (
    <div className="p-4 space-y-6">
      {/* Header Container */}
      <div className="bg-yellow-50 border border-yellow-200 p-5 rounded-xl shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-800 mb-1 flex items-center gap-2">
            <FaTags className="text-red-500" /> Manage Coupons
          </h1>
          <p className="text-sm text-gray-600">Create, view and delete promo codes.</p>
        </div>
        <button
          onClick={() => navigate("/admin/coupons/add")}
          className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-md"
        >
          + Add New Coupon
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white p-4 rounded-xl shadow-sm border">
        {isLoading ? (
          <p className="text-gray-500">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="text-gray-500">No coupons found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-gray-100 text-gray-600">
                <tr>
                  <th className="px-4 py-2">Coupon Code</th>
                  <th className="px-4 py-2">Discount</th>
                  <th className="px-4 py-2">Expiry Date</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{coupon.code}</td>
                    <td className="px-4 py-2 text-green-700">{coupon.discountPercentage}%</td>
                    <td className="px-4 py-2">
                      {new Date(coupon.expiresAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        className="text-teal-700 hover:underline flex items-center justify-center gap-1"
                        onClick={() => {
                          setSelectedCoupon(coupon.code);
                          setShowConfirm(true);
                        }}
                      >
                        <FaTrash /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          if (selectedCoupon) {
            deleteHandler(selectedCoupon);
          }
        }}
        title="Are you sure?"
        message="Do you really want to delete this coupon?"
      />
    </div>
  );
};

export default ManageCoupons;

