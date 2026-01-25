import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCoupon } from "../../services/couponService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddCouponForm = () => {
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState({});

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isLoading } = useMutation({
    mutationFn: createCoupon,
    onSuccess: () => {
      toast.success("🎉 Coupon created successfully");
      queryClient.invalidateQueries(["coupons"]);
      navigate("/admin/coupons");
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to create coupon");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!code.trim()) newErrors.code = "Coupon code is required";
    if (!discount || isNaN(discount) || discount <= 0)
      newErrors.discount = "Enter valid discount percentage";
    if (!expiresAt) newErrors.expiresAt = "Expiry date is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutate({
      code: code.trim(),
      discountPercentage: Number(discount),
      expiresAt,
    });
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white border rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🎫 Add New Coupon</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Code Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coupon Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="e.g. SUMMER25"
          />
          {errors.code && (
            <p className="text-red-500 text-xs mt-1">{errors.code}</p>
          )}
        </div>

        {/* Discount Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Discount Percentage (%) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={discount}
            onChange={(e) => setDiscount(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
            placeholder="e.g. 20"
            min={1}
          />
          {errors.discount && (
            <p className="text-red-500 text-xs mt-1">{errors.discount}</p>
          )}
        </div>

        {/* Expiry Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-red-400 focus:outline-none"
          />
          {errors.expiresAt && (
            <p className="text-red-500 text-xs mt-1">{errors.expiresAt}</p>
          )}
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white py-2 px-4 rounded-md font-medium transition duration-200"
          >
            {isLoading ? "Creating Coupon..." : "Create Coupon"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCouponForm;

