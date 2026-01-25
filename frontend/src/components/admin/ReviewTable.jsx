import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaTrash } from "react-icons/fa";
import { deleteReviewByAdmin } from "../../services/reviewService";
import ConfirmModal from "../common/ConfirmModal"; // ✅ already exists

const ReviewTable = ({ reviews }) => {
  const queryClient = useQueryClient();
  const [selectedReview, setSelectedReview] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { mutate: deleteHandler } = useMutation({
    mutationFn: deleteReviewByAdmin,
    onSuccess: () => {
      toast.success("Review deleted");
      queryClient.invalidateQueries(["admin-reviews"]);
    },
    onError: () => toast.error("Failed to delete review"),
  });

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm">
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{review.productName}</td>
                <td className="px-4 py-3">{review.name}</td>
                <td className="px-4 py-3">{"⭐".repeat(review.rating)}</td>
                <td className="px-4 py-3">{review.comment}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-teal-700 hover:underline text-sm flex items-center gap-1"
                    onClick={() => {
                      setSelectedReview({
                        productId: review.productId,
                        reviewId: review._id,
                      });
                      setShowConfirm(true);
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No reviews found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Confirm Delete Modal */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          if (selectedReview) {
            deleteHandler(selectedReview);
          }
        }}
        title="Are you sure?"
        message="Do you really want to delete this review? This action cannot be undone."
      />
    </div>
  );
};

export default ReviewTable;

