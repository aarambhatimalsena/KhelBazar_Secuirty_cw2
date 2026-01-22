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

// 🌐 RESPONSE INTERCEPTOR – handle auth expiry
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // If cookie session expired/invalid → backend will return 401
    if (status === 401) {
      window.dispatchEvent(new Event("force-logout"));
    }

    return Promise.reject(error);
  }
);

export default instance;
