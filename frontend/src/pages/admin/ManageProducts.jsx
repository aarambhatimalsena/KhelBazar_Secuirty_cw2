// src/pages/admin/ManageProducts.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen } from "react-icons/fa";

import ProductTable from "../../components/admin/ProductTable";
import ConfirmModal from "../../components/common/ConfirmModal";
import HeaderBox from "../../components/common/HeaderBox";

const ManageProducts = () => {
  const navigate = useNavigate();
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff3e8_0,_#fff9f3_45%,_#faf3e9_100%)]">
      <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 space-y-6">
        {/* HEADER – matches AddProduct tone */}
        <HeaderBox
          icon={<FaBoxOpen className="text-[#0f6b6f]" />}
          title="Manage Products"
          subtitle="View, edit or remove products from your KhelBazar catalog."
          action={
            <button
              onClick={() => navigate("/admin/products/add")}
              className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-[#0f6b6f] text-white hover:bg-[#0b5559] transition shadow-sm"
            >
              + Add New Product
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
                  Product Listings
                </h2>
                <p className="text-xs sm:text-sm text-gray-500">
                  Search, sort and manage all products currently live in your store.
                </p>
              </div>
              <button
                onClick={() => navigate("/admin/products/add")}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-full text-xs sm:text-sm font-medium bg-black text-white hover:bg-neutral-800 transition"
              >
                + Add Product
              </button>
            </div>

            <ProductTable onDeleteRequest={(id) => setConfirmDeleteId(id)} />
          </div>
        </div>
      </div>

      {/* CONFIRM MODAL */}
      <ConfirmModal
        open={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={() => {
          document.dispatchEvent(
            new CustomEvent("confirm-delete-product", {
              detail: confirmDeleteId,
            })
          );
          setConfirmDeleteId(null);
        }}
        title="Delete Product"
        message="Are you sure you want to delete this product?"
      />
    </div>
  );
};

export default ManageProducts;

