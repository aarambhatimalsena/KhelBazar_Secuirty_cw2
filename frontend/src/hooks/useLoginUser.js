import { useMutation } from "@tanstack/react-query";
import { loginUserService } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const useLoginUser = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const res = await loginUserService({ email, password });
      return res; // res = res.data from service
    },

    onSuccess: async (data) => {
      const profile = await login().catch(() => null);
      const isAdmin =
        profile?.role === "admin" || profile?.isAdmin || !!data?.isAdmin;

      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    },

    onError: (err) => {
      console.error("Login error:", err);
      throw err;
    },
  });
};

export default useLoginUser;
