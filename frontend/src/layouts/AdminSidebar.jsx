import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBoxOpen,
  FaList,
  FaShoppingCart,
  FaStar,
  FaUsers,
  FaTags,
  FaUserCircle,
  FaClipboardList,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import logo from "../assets/khelbazar-logo.png";

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
    { to: "/admin/products", label: "Products", icon: <FaBoxOpen /> },
    { to: "/admin/categories", label: "Categories", icon: <FaList /> },
    { to: "/admin/orders", label: "Orders", icon: <FaShoppingCart /> },
    { to: "/admin/reviews", label: "Reviews", icon: <FaStar /> },
    { to: "/admin/coupons", label: "Coupons", icon: <FaTags /> },
    { to: "/admin/users", label: "Users", icon: <FaUsers /> },
    { to: "/admin/audit-logs", label: "Audit Logs", icon: <FaClipboardList /> },
  ];

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-white border-r min-h-screen py-6 px-4 shadow-sm relative transition-all duration-300`}
    >
      {/* Logo + Collapse Button */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-2">
          <img src={logo} alt="KhelBazar" className="w-8 h-8" />
          {!collapsed && (
            <h1 className="text-xl font-semibold text-gray-800">KhelBazar</h1>
          )}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-500">
          {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex flex-col gap-1">
        {navLinks.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            title={collapsed ? label : ""}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium relative transition-all duration-200 group ${
                isActive
                  ? "text-teal-700 border-l-4 border-red-600 bg-red-50"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            <span className="text-lg">{icon}</span>
            {!collapsed && <span>{label}</span>}
            {/* Tooltip (when collapsed) */}
            {collapsed && (
              <span className="absolute left-full ml-2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 z-10 whitespace-nowrap transition">
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Profile Section */}
      <div className="absolute bottom-4 left-0 w-full px-4">
        <button className="flex items-center gap-2 text-gray-500 hover:text-teal-700">
          <FaUserCircle size={20} />
          {!collapsed && <span className="text-sm">Admin</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;


