import React from "react";
import AddCouponForm from "../../components/admin/AddCouponForm";

const AddCoupon = () => {
  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Add New Coupon</h1>
      <AddCouponForm />
    </div>
  );
};

export default AddCoupon;
