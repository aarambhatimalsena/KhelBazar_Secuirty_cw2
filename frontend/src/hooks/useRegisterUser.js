// src/hooks/useRegisterUser.js
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../auth/AuthProvider";

const useRegisterUser = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: async (data) => {
      if (data?.token) {
        await login().catch(() => {});
      }
      toast.success("Registered successfully!");
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Registration failed");
    },
  });
};

export default useRegisterUser;
