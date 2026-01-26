import React, { useEffect, useState } from "react";
import { FiEye, FiEyeOff, FiHome } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  logoutAllDevices,
} from "../../services/userService";
import toast from "react-hot-toast";
import { evaluatePassword } from "../../utils/passwordPolicy";

const UserProfile = () => {
  const { user, updateUser, logout, suppressNextForceLogoutToast } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // ===== LOAD PROFILE ONCE =====
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setFormData({
          name: data.name || "",
          email: data.email || "",
          password: "",
          confirmPassword: "",
        });
        updateUser(data);
      } catch (err) {
        toast.error("❌ Failed to load profile");
      } finally {
        setProfileLoaded(true);
      }
    };

    fetchProfile();
  }, []); // run once

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const passwordEval = evaluatePassword(formData.password, {
    name: formData.name,
    email: formData.email,
  });
  const strength = passwordEval.label;

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imgForm = new FormData();
    imgForm.append("image", file);

    try {
      const result = await uploadProfileImage(imgForm);
      updateUser({ ...user, profileImage: result.profileImage });
      setPreviewImage(result.profileImage);

      window.dispatchEvent(new Event("update-profile"));

      toast.success("Profile photo updated");
    } catch (err) {
      const status = err?.response?.status;

      if (status === 401) {
        suppressNextForceLogoutToast();
        toast.error("Session expired. Please login again.");
        return;
      }

      if (status === 429) {
        toast.error("Too many attempts. Try again later");
        return;
      }

      if (status === 400 || status === 413 || err?.code === "LIMIT_FILE_SIZE") {
        toast.error("Upload failed. Please use a valid image file.");
        return;
      }

      toast.error("Could not update profile photo. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===== PASSWORD VALIDATION =====
    if (formData.password || formData.confirmPassword) {
      if (!formData.password || !formData.confirmPassword) {
        toast.error("Please enter and confirm your new password.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("New password and confirm password do not match.");
        return;
      }

      if (!passwordEval.ok) {
        toast.error(passwordEval.reason);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = { ...formData };

      delete payload.confirmPassword;
      if (!formData.password) delete payload.password;

      const updatedUser = await updateUserProfile(payload);
      updateUser(updatedUser);

      toast.success("✅ Profile updated successfully!");
      setFormData((prev) => ({
        ...prev,
        password: "",
        confirmPassword: "",
      }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
    setPreviewImage(null);
  };

  const handleLogoutAllDevices = async () => {
    try {
      await logoutAllDevices();
      suppressNextForceLogoutToast();
      logout();
      toast.success("All sessions revoked. Please log in again.");
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to logout all devices"
      );
    }
  };

  return (
    <>
      {/* 🧭 Breadcrumb */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700 border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FiHome className="inline-block w-4 h-4" />
            <Link to="/" className="hover:underline hover:text-gray-800">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <span className="font-semibold text-gray-900">My Account</span>
          </div>
          {user?.name && (
            <p className="text-xs text-gray-500">
              Welcome,&nbsp;
              <span className="font-semibold text-gray-800">{user.name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Page background */}
      <div className="bg-[#faf7f2]">
        <div className="max-w-6xl mx-auto px-4 lg:px-0 py-10 flex flex-col md:flex-row gap-10">
          {/* LEFT SIDEBAR */}
          <aside className="w-full md:w-64">
            <div className="bg-white/80 border border-gray-200 rounded-2xl px-5 py-6 shadow-sm">
              {/* Manage account */}
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
                  Manage My Account
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <span className="inline-flex items-center rounded-full px-3 py-1 bg-gray-900 text-white text-xs font-semibold uppercase tracking-[0.16em]">
                      My Profile
                    </span>
                  </li>
                </ul>
              </div>

              {/* Orders (only My Orders) */}
              <div className="mb-6">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
                  My Orders
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/orders"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      My Orders
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Wishlist */}
              <div>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 mb-3">
                  My Wishlist
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      to="/wishlist"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      View Wishlist
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <section className="flex-1">
            <div className="bg-white border border-gray-200 rounded-[22px] px-6 md:px-10 py-8 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between gap-6 mb-8">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-1">
                    Account
                  </p>
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
                    Edit Your Profile
                  </h1>
                  <p className="text-xs text-gray-500">
                    Manage your personal details and update your password.
                  </p>
                  {user?.email && (
                    <p className="mt-1 text-xs text-gray-400">
                      Signed in as{" "}
                      <span className="font-medium text-gray-700">
                        {user.email}
                      </span>
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                      <img
                        src={
                          previewImage ||
                          user?.profileImage ||
                          "/default-avatar.png"
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <label className="cursor-pointer text-xs md:text-sm bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-black transition">
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Form */}
              {!profileLoaded ? (
                <p className="text-sm text-gray-500">Loading profile...</p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-10">
                  {/* BASIC INFO */}
                  <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-[0.18em]">
                          Full Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-[0.18em]">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-4 border-t border-gray-100 pt-6">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Password
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                      {/* New Password */}
                      <div className="relative">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-[0.18em]">
                          New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Leave blank to keep current password"
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-9 text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Leave this field empty if you don&apos;t want to change
                          your password.
                        </p>
                        {formData.password && (
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
                      <div className="relative">
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-[0.18em]">
                          Confirm New Password
                        </label>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Re-enter new password"
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                        />
                        <span
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-9 text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </span>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Make sure both passwords match exactly.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* BUTTONS */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleLogoutAllDevices}
                      className="px-6 py-2.5 rounded-full border border-gray-300 bg-white text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 hover:bg-gray-50"
                    >
                      Logout All Devices
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2.5 rounded-full border border-gray-300 bg-white text-xs font-semibold uppercase tracking-[0.18em] text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-7 py-2.5 rounded-full bg-[#111827] text-white text-xs font-semibold uppercase tracking-[0.2em] hover:bg-black disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default UserProfile;
