import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthProvider";

const NormalUserRoute = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <>Loading...</>;

  if (!user) return <Navigate to="/login" />;
  if (user.role === "admin") return <Navigate to="/admin" />;

  return <Outlet />;
};

export default NormalUserRoute;
