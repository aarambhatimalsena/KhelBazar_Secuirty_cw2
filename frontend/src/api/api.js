// src/services/axios.js
import axios from "axios";

// ✅ Force Vite proxy for local HTTPS demo (most stable)
const baseURL = "/api";

const instance = axios.create({
  baseURL,
  withCredentials: true, // ✅ send httpOnly cookies
});

// ✅ Helper: read a cookie by name
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

// ✅ REQUEST INTERCEPTOR – attach CSRF header for unsafe methods only
instance.interceptors.request.use(
  (config) => {
    const method = (config.method || "get").toLowerCase();
    const unsafe = ["post", "put", "patch", "delete"].includes(method);

    if (unsafe) {
      const csrfToken = getCookie("csrfToken"); // ✅ non-httpOnly cookie
      if (csrfToken) {
        config.headers["x-csrf-token"] = csrfToken;
      }
    }

    // ❌ DO NOT attach Authorization header (cookie-only auth)
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Helper: public routes should not force redirect on 401
const isPublicAuthRoute = () => {
  const path = window.location.pathname || "";

  return (
    path.startsWith("/reset-password/") ||
    path === "/forgot-password" ||
    path === "/login" ||
    path === "/register" ||
    path === "/verify-email"
  );
};

// 🌐 RESPONSE INTERCEPTOR – handle auth expiry (secure, but don’t break public flows)
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // If cookie session expired/invalid → backend may return 401
    // ✅ But do NOT redirect on public auth pages (reset/forgot/login/register/verify)
    if (status === 401) {
      if (!isPublicAuthRoute()) {
        window.dispatchEvent(new Event("force-logout"));
      }
      // else: ignore redirect so reset/forgot pages can load
    }

    return Promise.reject(error);
  }
);

export default instance;
