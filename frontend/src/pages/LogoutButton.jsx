import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider"; 


const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); // redirect to login after logout
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-teal-700 text-white rounded hover:bg-teal-800"
    >
      Logout
    </button>
  );
};

export default LogoutButton;

