// src/routes/AppRouter.jsx
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect } from "react";

// Layouts and Middleware
import MainLayout from "../layouts/MainLayout";
import AdminLayout from "../layouts/AdminLayout";
import GuestRoute from "./GuestRoute";
import AdminRoute from "./AdminRoute";
import NormalUserRoute from "./NormalUserRoute";

// Public Pages
import ProductListPage from "../pages/ProductListPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import AboutPage from "../pages/AboutPage";
import CategoryPage from "../pages/CategoryPage";
import ContactPage from "../pages/ContactPage";

// Auth Pages
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";

// Admin Pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AddProduct from "../pages/admin/AddProduct";
import EditProduct from "../pages/admin/EditProduct";
import ManageProducts from "../pages/admin/ManageProducts";
import ManageCategories from "../pages/admin/ManageCategories";
import AddCategory from "../pages/admin/AddCategory";
import EditCategory from "../pages/admin/EditCategory";
import ManageOrders from "../pages/admin/ManageOrders";
import OrderDetail from "../pages/admin/OrderDetail";
import ManageUsers from "../pages/admin/ManageUsers";
import AdminReviews from "../pages/admin/AdminReviews";
import ManageCoupons from "../pages/admin/ManageCoupons";
import AddCoupon from "../pages/admin/AddCoupon";
import AuditLogs from "../pages/admin/AuditLogs";

// User Pages
import UserDashboard from "../pages/user/UserDashboard";
import UserProfile from "../pages/user/UserProfile";
import WishlistPage from "../pages/user/WishlistPage";
import CartPage from "../pages/user/CartPage";
import CheckoutPage from "../pages/user/CheckoutPage";
import CheckoutSuccessPage from "../pages/user/CheckoutSuccessPage";
import OrdersPage from "../pages/user/OrdersPage";
import UserOrderDetail from "../pages/user/UserOrderDetail";

import { useAuth } from "../auth/AuthProvider";

const AppRouter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleForceLogout = () => {
      navigate("/login");
    };

    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, [navigate]);

  return (
    <Routes>
      {/* Public + root routes inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route
          path="/"
          element={
            user ? (
              user.isAdmin ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            ) : (
              // 🔥 GUEST user pani: KhelBazar UI (UserDashboard) dekhaune
              <UserDashboard />
            )
          }
        />

        <Route path="/products" element={<ProductListPage />} />
        <Route path="/category/:categoryName" element={<CategoryPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Forgot + Reset Password */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Guest-only Routes */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
      </Route>

      {/* Admin-only Routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<ManageProducts />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/:id/edit" element={<EditProduct />} />
          <Route path="categories" element={<ManageCategories />} />
          <Route path="categories/add" element={<AddCategory />} />
          <Route path="categories/:id/edit" element={<EditCategory />} />
          <Route path="orders" element={<ManageOrders />} />
          <Route path="orders/:orderId" element={<OrderDetail />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<ManageCoupons />} />
          <Route path="coupons/add" element={<AddCoupon />} />
          <Route path="audit-logs" element={<AuditLogs />} />
        </Route>
      </Route>

      {/* User-only Routes */}
      <Route element={<NormalUserRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-success" element={<CheckoutSuccessPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<UserOrderDetail />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRouter;

