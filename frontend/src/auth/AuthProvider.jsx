import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../api/api.js"; // dY`^ use our axios instance
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const forceLogoutHandledRef = useRef(false);
  const suppressForceLogoutToastRef = useRef(false);

  // dY"? Helper: load profile from backend using httpOnly cookie
  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      const profile = res.data;
      setUser({ ...profile, isAdmin: profile.role === "admin" });
      return profile;
    } catch (err) {
      console.error("Failed to fetch profile", err);
      throw err;
    }
  };

  // ---------- On app start: check session + load profile ----------
  useEffect(() => {
    const init = async () => {
      // Avoid "session expired" toast on initial session check.
      suppressForceLogoutToastRef.current = true;
      try {
        await fetchProfile();
        suppressForceLogoutToastRef.current = false;
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ---------- Listen for force-logout from axios interceptor ----------
  useEffect(() => {
    const handleForceLogout = () => {
      if (forceLogoutHandledRef.current) return;
      forceLogoutHandledRef.current = true;
      console.warn("Received force-logout event");
      setUser(null);
      window.dispatchEvent(new Event("update-wishlist-count"));
      window.dispatchEvent(new Event("update-cart-count"));
      if (!suppressForceLogoutToastRef.current) {
        toast.error("Session expired. Please login again.");
      }
      suppressForceLogoutToastRef.current = false;
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    };

    window.addEventListener("force-logout", handleForceLogout);
    return () => window.removeEventListener("force-logout", handleForceLogout);
  }, []);

  // ---------- Login (cookie-based; fetch profile) ----------
  const login = async () => {
    try {
      const profile = await fetchProfile();
      forceLogoutHandledRef.current = false;
      suppressForceLogoutToastRef.current = false;
      window.dispatchEvent(new Event("update-wishlist-count"));
      window.dispatchEvent(new Event("update-cart-count"));
      window.dispatchEvent(new Event("update-profile")); // header update
      return profile;
    } catch (err) {
      console.error("Failed to fetch profile after login", err);
      setUser(null);
      throw err;
    }
  };

  // ---------- Logout ----------
  const logout = () => {
    forceLogoutHandledRef.current = false;
    setUser(null);
    window.dispatchEvent(new Event("update-wishlist-count"));
    window.dispatchEvent(new Event("update-cart-count"));
    // optional: call backend logout to clear httpOnly cookie too
    api.post("/users/logout").catch(() => {});
  };

  const suppressNextForceLogoutToast = () => {
    suppressForceLogoutToastRef.current = true;
    forceLogoutHandledRef.current = false;
  };

  const updateUser = (newData) => {
    setUser((prev) => (prev ? { ...prev, ...newData } : prev));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        suppressNextForceLogoutToast,
        loading,
        isAuthenticated: !!user,
        setUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
