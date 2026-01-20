import express from "express";
import rateLimit from "express-rate-limit";

import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  googleAuthController,
  forgotPassword,
  resetPassword,
  logoutUser,
  verifyLogin2FA,
  sendVerificationOtp,
  verifyEmailOtp,
  logoutAllDevices,
} from "../controllers/userController.js";

import {
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/uploadProfileController.js";

import { protect } from "../middleware/authMiddleware.js";
import { requireCaptcha } from "../middleware/captchaMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";
import {
  validateRegister,
  validateLogin,
} from "../middleware/validators/userValidator.js";
import upload, { validateImageSignature } from "../middleware/upload.js";

const router = express.Router();

// OTP verification rate limits
const verifyOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification attempts. Try again later." },
});

const resendOtpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Try again later." },
});

// ----------------------------------
// REGISTER & LOGIN
// ----------------------------------

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);

// 🔐 2FA
router.post("/login/2fa-verify", verifyLogin2FA);

// Email verification OTP
router.post("/send-verification-otp", resendOtpLimiter, sendVerificationOtp);
router.post("/verify-email-otp", verifyOtpLimiter, verifyEmailOtp);

// Google auth
router.post("/google-auth", googleAuthController);

// Forgot / Reset password
router.post("/forgot-password", requireCaptcha, forgotPassword);
router.post("/reset-password/:token", resetPassword);

// Logout
router.post("/logout", protect, logoutUser);
router.post("/logout-all", protect, requireCsrf, logoutAllDevices);

// ----------------------------------
// USER PROFILE
// ----------------------------------

router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// ----------------------------------
// PROFILE IMAGE UPLOAD / DELETE
// ----------------------------------

router.put(
  "/profile/upload",
  protect,
  upload.single("image"), // multer field name
  validateImageSignature,
  uploadProfileImage
);

router.delete("/profile/image", protect, deleteProfileImage);

export default router;
