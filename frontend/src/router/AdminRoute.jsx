import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const AdminRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [redirectPath, setRedirectPath] = useState(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setRedirectPath("/login");
      } else if (!(user?.isAdmin || user?.role === "admin")) {
        toast.error("Access denied! Admins only.");
        setRedirectPath("/dashboard");
      }
    }
  }, [user, loading]);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (redirectPath) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;
