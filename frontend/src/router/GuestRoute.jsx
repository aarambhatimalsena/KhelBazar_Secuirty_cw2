import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import ProductDetailPage from "../pages/ProductDetailPage";


const GuestRoute = () => {
  const { user } = useAuth();

  return user ? <Navigate to="/" /> : <Outlet />;
};


export default GuestRoute;
