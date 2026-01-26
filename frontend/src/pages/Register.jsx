import React from "react";
import RegisterForm from "../components/auth/RegisterForm";
import Header from "../layouts/Header";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";

const Register = () => {
  return (
    <>
      <Header />

      {/* Centered Breadcrumb */}
      <div className="bg-[#f7f3ee] py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="flex items-center text-sm text-gray-600 space-x-2">
            <FiHome className="text-gray-500" />
            <Link to="/" className="underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400"></span>
            <span className="text-black font-regular">Create Account</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="flex justify-center items-center py-16 px-4">
        <div className="w-full max-w-md p-8 bg-white shadow-md rounded-2xl">
          <h2 className="text-2xl font-semibold text-center mb-6">Create Account</h2>
          <RegisterForm />
        </div>
      </div>
    </>
  );
};

export default Register;
