import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiHome, FiEye, FiEyeOff } from "react-icons/fi";
import Header from "../layouts/Header";
import { resetPassword } from "../services/authService";
import { evaluatePassword } from "../utils/passwordPolicy";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 👁️ show / hide states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordEval = evaluatePassword(password);
  const strength = passwordEval.label;

  const handleReset = async (e) => {
    e.preventDefault();

    // 🔐 strong password validation
    if (!passwordEval.ok) {
      toast.error(passwordEval.reason, {
        style: {
          background: "#f87171",
          color: "white",
          border: "1px solid #ef4444",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "white",
        },
      });
      return;
    }

    // 🔐 confirm match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match", {
        style: {
          background: "#f87171",
          color: "white",
          border: "1px solid #ef4444",
        },
        iconTheme: {
          primary: "#ef4444",
          secondary: "white",
        },
      });
      return;
    }

    try {
      setLoading(true);
      await resetPassword(token, password);
      toast.success("Password has been reset successfully");
      navigate("/login");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to reset password",
        {
          style: {
            background: "#f87171",
            color: "white",
            border: "1px solid #ef4444",
          },
          iconTheme: {
            primary: "#ef4444",
            secondary: "white",
          },
        }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <FiHome className="inline-block w-4 h-4" />
          <Link to="/" className="underline hover:text-gray-800">
            Home
          </Link>
          <span>/</span>
          <span className="text-black">Reset Password</span>
        </div>
      </div>

      {/* Reset Password Box */}
      <div className="flex justify-center px-4 mt-10">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <h2 className="text-center text-2xl font-semibold mb-6">
            Reset Your Password
          </h2>

          <form onSubmit={handleReset} className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-red-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {/* 🔐 visible rules */}
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                Use <span className="font-semibold">8-32 characters</span>,
                avoid common words/sequences, and make it longer for better
                security.
              </p>
              {password && (
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[11px] text-gray-500">
                    Strength:{" "}
                    <span
                      className={`font-semibold ${
                        strength === "Strong"
                          ? "text-emerald-600"
                          : strength === "Medium"
                          ? "text-amber-500"
                          : "text-red-500"
                      }`}
                    >
                      {strength}
                    </span>
                  </p>
                  <div className="flex gap-1 items-center">
                    <span
                      className={`h-1.5 w-8 rounded-full ${
                        strength === "Weak"
                          ? "bg-red-400"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span
                      className={`h-1.5 w-8 rounded-full ${
                        strength === "Strong"
                          ? "bg-emerald-500"
                          : strength === "Medium"
                          ? "bg-amber-400"
                          : "bg-gray-200"
                      }`}
                    />
                    <span
                      className={`h-1.5 w-8 rounded-full ${
                        strength === "Strong"
                          ? "bg-emerald-500"
                          : "bg-gray-200"
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-2 pr-10 rounded-lg focus:outline-none ${
                    confirmPassword && confirmPassword !== password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-blue-50"
                  }`}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-lg text-white font-medium ${
                loading
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-[#0f6b6f] hover:bg-teal-800"
              }`}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;






