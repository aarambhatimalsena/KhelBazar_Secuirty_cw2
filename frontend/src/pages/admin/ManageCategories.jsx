// src/pages/admin/ManageCategories.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FaList } from "react-icons/fa";

import {
  getAllCategories,
  deleteCategory,
} from "../../services/categoryService";
import ConfirmModal from "../../components/common/ConfirmModal";
import CategoryTable from "../../components/admin/CategoryTable";
import HeaderBox from "../../components/common/HeaderBox";

const ManageCategories = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // 🔹 Fetch categories
  const {
    data: categories = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });

  // 🔹 Delete mutation
  const { mutate: deleteHandler } = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
    },
  });

  const handleConfirmDelete = () => {
    if (confirmDeleteId) {
      deleteHandler(confirmDeleteId);
      setConfirmDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-6">
        {/* HEADER – same tone as ManageProducts/AddProduct */}
        <HeaderBox
          icon={<FaList className="text-[#0f6b6f]" />}
          title="Manage Categories"
          subtitle="View, create or remove categories that organise your KhelBazar catalog."
          action={
            <button
              onClick={() => navigate("/admin/categories/add")}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-[#0f6b6f] text-white hover:bg-[#0b5559] transition shadow-sm"
            >
              + Add New Category
            </button>
          }
        />

        {/* MAIN CARD */}
        <div className="bg-white/95 rounded-[26px] border border-[#f3e0d8] shadow-[0_18px_45px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* subtle top accent line */}
          <div className="h-1 w-full bg-gradient-to-r from-[#0f6b6f] via-[#5fb7b5] to-[#f2a654]" />

          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                  Category Library
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Keep your store clean by managing every category and its
                  display image.
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/categories/add")}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-black text-white hover:bg-neutral-800 transition"
              >
                + Add Category
              </button>
            </div>

            {/* TABLE / STATES */}
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading categories…</p>
            ) : isError ? (
              <p className="text-sm text-red-500">
                Failed to load categories. Please refresh and try again.
              </p>
            ) : categories.length === 0 ? (
              <div className="py-8 text-sm text-gray-500">
                No categories yet. Start by adding your first category.
              </div>
            ) : (
              <CategoryTable
                categories={categories}
                onDelete={(id) => setConfirmDeleteId(id)}
              />
            )}
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category?"
      />
    </div>
  );
};

export default ManageCategories;

