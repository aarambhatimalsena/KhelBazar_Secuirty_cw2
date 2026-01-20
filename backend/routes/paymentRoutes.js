// routes/paymentRoutes.js
import express from "express";
import rateLimit from "express-rate-limit";
import {
  handleEsewaSuccess,
  handleEsewaFailure,
  handleKhaltiVerification,
  simulatePaymentSuccess,
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireCsrf } from "../middleware/csrfMiddleware.js";

const router = express.Router();

// 🔐 Limit payment callback abuse
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many payment requests. Please try again later.",
  },
});

// ================= PAYMENT ROUTES =================

// ❌ Third-party callbacks → CSRF not required
router.get("/esewa/success", paymentLimiter, handleEsewaSuccess);
router.get("/esewa/failure", paymentLimiter, handleEsewaFailure);

// ✅ User-initiated POST → CSRF required
router.post(
  "/khalti/verify",
  protect,
  requireCsrf,
  paymentLimiter,
  handleKhaltiVerification
);

// ✅ Simulated payment success (no third-party)
router.post(
  "/simulate-success",
  protect,
  requireCsrf,
  paymentLimiter,
  simulatePaymentSuccess
);

export default router;
