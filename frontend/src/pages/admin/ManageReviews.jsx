// src/pages/admin/ManageReviews.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllReviews } from "../../services/reviewService";
import ReviewTable from "../../components/admin/ReviewTable";
import HeaderBox from "../../components/common/HeaderBox";
import { FaStar } from "react-icons/fa";
import toast from "react-hot-toast";

const ManageReviews = () => {
  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getAllReviews,
    onError: () => toast.error("Failed to load reviews"),
  });

  const totalReviews = reviews.length || 0;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-6">
        {/* HEADER */}
        <HeaderBox
          icon={<FaStar className="text-[#facc15]" />}
          title="Manage Product Reviews"
          subtitle="Moderate customer feedback and keep your storefront clean and trustworthy."
        />

        {/* MAIN CARD */}
        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">

          {/* PERFECT RED ACCENT BAR */}
          <div className="relative w-full h-[12px] overflow-hidden">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#e11d48] via-[#ef4444] to-[#e11d48] h-[5px] top-[3px] shadow-[0_3px_6px_rgba(255,0,0,0.18)]" />
          </div>

          <div className="p-4 sm:p-6">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Review Overview
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  See what customers are saying and remove spam or inappropriate reviews.
                </p>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-yellow-50 text-[11px] sm:text-xs font-medium text-yellow-700 border border-yellow-100">
                  ⭐ Total Reviews:{" "}
                  <span className="font-semibold">{totalReviews}</span>
                </span>
              </div>
            </div>

            {/* TABLE */}
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading reviews…</p>
            ) : isError ? (
              <p className="text-sm text-red-500">
                Failed to load reviews. Please try again.
              </p>
            ) : (
              <ReviewTable reviews={reviews} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageReviews;
