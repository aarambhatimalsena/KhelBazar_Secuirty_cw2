import React from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const CategoryTable = ({ categories, onDelete }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
      <div className="max-h-[500px] overflow-y-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Category Name</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat._id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-800">
                  {cat.name}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-4 text-gray-600">
                    <button
                      className="hover:text-yellow-500"
                      onClick={() =>
                        navigate(`/admin/categories/${cat._id}/edit`)
                      }
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="hover:text-teal-700"
                      onClick={() => onDelete(cat._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="px-4 py-6 text-center text-gray-500"
                >
                  No categories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryTable;

