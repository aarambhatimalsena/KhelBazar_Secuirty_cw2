import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllReviews } from "../../services/reviewService";
import ReviewTable from "../../components/admin/ReviewTable";
import HeaderBox from "../../components/common/HeaderBox";
import { FaStar } from "react-icons/fa";

const AdminReviews = () => {
  const { data: reviews = [], isLoading, isError } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: getAllReviews,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  const filteredReviews = reviews
    .filter(
      (r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === "high") return b.rating - a.rating;
      if (sortOption === "low") return a.rating - b.rating;
      return 0;
    });

  return (
    <div className="bg-[#fffcee] min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* ✅ HeaderBox */}
        <HeaderBox
          icon={<FaStar className="text-yellow-500 text-xl" />}
          title="Manage Product Reviews"
          subtitle="Search, sort, and manage user reviews efficiently."
        />

        {/* 🔍 Search & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="🔍 Search by user or product"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded-md w-full sm:w-1/2 shadow-sm"
          />

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-4 py-2 rounded-md w-full sm:w-1/3 shadow-sm"
          >
            <option value="newest">📅 Newest First</option>
            <option value="oldest">📅 Oldest First</option>
            <option value="high">⭐ Highest Rating</option>
            <option value="low">⭐ Lowest Rating</option>
          </select>
        </div>

        {/* ✅ Table */}
        <div className="bg-white p-4 rounded-xl shadow-sm border">
          {isLoading && <p className="text-gray-500">Loading reviews...</p>}
          {isError && <p className="text-red-500">Failed to load reviews.</p>}
          {!isLoading && !isError && <ReviewTable reviews={filteredReviews} />}
        </div>
      </div>
    </div>
  );
};

export default AdminReviews;
