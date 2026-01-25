import React from "react";
import { useAuth } from "../auth/AuthProvider";
import { FiLogOut } from "react-icons/fi";

const AdminTopbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
      <h2 className="text-xl font-semibold text-gray-700">Admin Dashboard</h2>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium text-gray-800">
            {user?.name || "Admin User"}
          </div>
          <div className="text-xs text-gray-500">
            {user?.email || "admin@kalamkart.com"}
          </div>
        </div>

        {/* Profile Circle */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
          {user?.name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="flex items-center text-sm gap-1 text-gray-600 hover:text-teal-700"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;

