import React from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import Header from "../layouts/Header";
import LoginForm from "../components/auth/LoginForm";


const Login = () => {
  return (
    <>
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700">
        <div className="max-w-5xl mx-auto flex justify-start items-center gap-2">
          <FiHome className="inline-block w-4 h-4" />
                      <Link to="/" className="underline hover:text-gray-800">
                        Home
                      </Link>

          <span>/</span>
          <span className="text-black font-regular">Login</span>
        </div>
      </div>

      {/* Login Box (just like Register) */}
      <div className="flex justify-center px-4 mt-10">
      <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <h2 className="text-center text-2xl font-semibold mb-6">
            Login 
          </h2>
          <LoginForm />
        </div>
      </div>
    </>
  );
};

export default Login;
