// src/services/authService.js
import api from "../api/api";

// 🔐 Login with email/password
export const loginUserService = async ({ email, password, captchaToken }) => {
  // Backend:
  //  - normal case: { _id, name, email, isAdmin, profileImage, token, ... }
  //  - 2FA case: { requires2FA: true, challengeToken, message }
  const payload = { email, password };
  if (captchaToken) payload.captchaToken = captchaToken;
  const { data } = await api.post("/users/login", payload);
  return data;
};

// 🆕 Register new user
export const registerUserService = async ({ name, email, password }) => {
  const { data } = await api.post("/users/register", {
    name,
    email,
    password,
  });
  return data;
};

// 🔐 Email verification OTP
export const sendVerificationOtpService = async (email) => {
  const { data } = await api.post("/users/send-verification-otp", { email });
  return data;
};

export const verifyEmailOtpService = async ({ email, otp }) => {
  const { data } = await api.post("/users/verify-email-otp", { email, otp });
  return data;
};

// 🌐 Google OAuth login
// route: POST /api/users/google-auth
export const googleLoginService = async (payload) => {
  const body =
    typeof payload === "string"
      ? { credential: payload }
      : payload && (payload.token || payload.credential)
      ? payload
      : { token: payload };
  const { data } = await api.post("/users/google-auth", body);
  return data;
};

// ✉️ (Optional) Generic OTP send – if you still use /otp/send-otp route
export const sendOtp = async (email) => {
  const { data } = await api.post("/otp/send-otp", { email });
  return data;
};

// 🔢 (Optional) Generic OTP verify – if you still use /otp/verify-otp route
export const verifyOtp = async (payload) => {
  const { data } = await api.post("/otp/verify-otp", payload);
  return data;
};

// 🔁 Forgot password
export const forgotPassword = async (email, captchaToken) => {
  const payload = { email };
  if (captchaToken) payload.captchaToken = captchaToken;
  const { data } = await api.post("/users/forgot-password", payload);
  return data;
};

// 🔐 Reset password with token
export const resetPassword = async (token, password) => {
  const { data } = await api.post(`/users/reset-password/${token}`, {
    password,
  });
  return data;
};

// 🧩 2FA login verification (suspicious login OTP)
export const verifyLogin2FAService = async ({ otp, challengeToken }) => {
  // backend route: POST /api/users/login/2fa-verify
  const { data } = await api.post("/users/login/2fa-verify", {
    otp,
    challengeToken,
  });
  // returns normal user payload: { _id, name, email, isAdmin, profileImage, token }
  return data;
};
