import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../../services/adminService";
import UserTable from "../../components/admin/UserTable";

const ManageUsers = () => {
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["admin-users"],
    queryFn: getAllUsers,
  });

  return (
    <div className="bg-[#fffcee] min-h-screen p-6">
      <div className="max-w-6xl mx-auto">

        {/* 💛 Header Box */}
        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Manage Users
          </h2>
          <p className="text-gray-600">
            View, delete or manage roles of users registered on KhelBazar.
          </p>
        </div>

        {/* White Table Card */}
        <div className="bg-white border rounded-xl p-4 shadow-sm">
          {isLoading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : isError ? (
            <p className="text-red-500">Failed to fetch users</p>
          ) : (
            <UserTable users={users} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;

