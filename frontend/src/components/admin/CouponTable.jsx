import React from "react";
import { FaTrash } from "react-icons/fa";
import ConfirmModal from "../common/ConfirmModal";

const CouponTable = ({
  coupons,
  onDeleteClick,
  selectedCode,
  setSelectedCode,
  showConfirm,
  setShowConfirm,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border shadow-sm">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-600">
          <tr>
            <th className="px-4 py-3 font-medium">Code</th>
            <th className="px-4 py-3 font-medium">Discount</th>
            <th className="px-4 py-3 font-medium">Expiry</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.length > 0 ? (
            coupons.map((coupon) => (
              <tr key={coupon._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{coupon.code}</td>
                <td className="px-4 py-2">{coupon.discountPercentage}%</td>
                <td className="px-4 py-2">
                  {new Date(coupon.expiresAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <button
                    className="text-teal-700 hover:text-red-800 flex items-center gap-1"
                    onClick={() => {
                      setSelectedCode(coupon.code);
                      setShowConfirm(true);
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                No coupons available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ Delete Confirmation Modal */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onDeleteClick(selectedCode)}
        title="Delete Coupon"
        message="Are you sure you want to delete this coupon?"
      />
    </div>
  );
};

export default CouponTable;

