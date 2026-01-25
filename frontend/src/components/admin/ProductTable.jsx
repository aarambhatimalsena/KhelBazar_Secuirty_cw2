import React, { useState } from "react";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";
import useProducts from "../../hooks/useProducts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProduct } from "../../services/productService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../common/ConfirmModal";

const ProductTable = () => {
  const { data: products = [], isLoading, isError } = useProducts();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries(["products"]);
    },
    onError: () => {
      toast.error("Failed to delete product");
    },
  });

  const confirmDelete = (id) => {
    setSelectedId(id);
    setConfirmOpen(true);
  };

  if (isLoading) return <p className="text-gray-500 text-sm">Loading products...</p>;
  if (isError) return <p className="text-red-500 text-sm">Failed to load products</p>;

  return (
    <div className="overflow-hidden">
      <div className="max-h-[500px] overflow-y-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-600 sticky top-0 z-10">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <div className="font-medium text-gray-800">
                      {product.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: #{product._id}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 text-gray-700">{product.category}</td>

                <td className="px-4 py-3 font-semibold text-gray-800">
                  ₹{product.price?.toLocaleString()}
                </td>

                <td className="px-4 py-3 text-gray-700">
                  {product.stock || 0} units
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center gap-3 text-gray-600">
                    <button
                      className="hover:text-blue-600"
                      onClick={() => console.log("view", product._id)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="hover:text-yellow-500"
                      onClick={() => navigate(`/admin/products/${product._id}/edit`)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="hover:text-teal-700"
                      onClick={() => confirmDelete(product._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => handleDelete(selectedId)}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
      />
    </div>
  );
};

export default ProductTable;
