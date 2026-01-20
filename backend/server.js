// server.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import xssClean from "xss-clean";
import rateLimit from "express-rate-limit";
import hpp from "hpp";

//  HTTPS imports
import https from "https";
import fs from "fs";
import path from "path";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { requireCsrfUnlessExempt } from "./middleware/csrfMiddleware.js";

// ======================
// 🌱 Environment Setup
// ======================
dotenv.config();

// Connect DB (skip during tests)
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Create express app
const app = express();

// Trust proxy in production (Render/Heroku/Nginx)
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// ======================
// 🔐 Global Security Middleware
// ======================

// 1) Security headers + CSP
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://localhost:5173",
  "https://127.0.0.1:5173",
].filter(Boolean);

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": [
          "'self'",
          "https://accounts.google.com",
          "https://*.gstatic.com",
          "https://challenges.cloudflare.com",
        ],
        "frame-src": [
          "https://accounts.google.com",
          "https://challenges.cloudflare.com",
        ],
        "connect-src": [
          "'self'",
          "https://challenges.cloudflare.com",
          ...allowedOrigins,
        ],
      },
    },
  })
);

// 2) CORS allowlist
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // Postman/mobile apps
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: origin not allowed"), false);
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "x-csrf-token"],
  })
);

// 3) JSON parser (limit)
app.use(express.json({ limit: "10kb" }));

// 4) Cookie parser
app.use(cookieParser());

// 4.5) CSRF guard for unsafe requests
app.use(requireCsrfUnlessExempt);

/**
 * ⚠️ Express 5 FIX for express-mongo-sanitize
 * Express 5 req.query is getter-only → sanitize tries to override → crash.
 * This middleware converts req.query into a writable object.
 */
app.use((req, res, next) => {
  try {
    Object.defineProperty(req, "query", {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  } catch (e) {
    // continue (better than crashing)
  }
  next();
});

// 5) Prevent NoSQL Injection
app.use(mongoSanitize());

// 6) Prevent XSS
app.use(xssClean());

// 6.5) Prevent HTTP Parameter Pollution
app.use(hpp());

// ======================
// 🛡️ Rate Limiters (separate)
// ======================

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Try again later." },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests. Try again later." },
});

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many payment requests. Try again later." },
});

// ======================
// 🚏 Routes
// ======================

// Sensitive routes with rate limit
app.use("/api/users/login", loginLimiter);
app.use("/api/users/register", loginLimiter);
app.use("/api/users/forgot-password", loginLimiter);
app.use("/api/users/reset-password", loginLimiter);

app.use("/api/otp", otpLimiter, otpRoutes);
app.use("/api/payments", paymentLimiter, paymentRoutes);

// Normal routes
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/notifications", notificationRoutes);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({ message: "Route not found." });
});

// Central error handler (prevents info leakage in production)
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;

  const message =
    process.env.NODE_ENV === "production"
      ? "Something went wrong"
      : err.message;

  return res.status(status).json({ message });
});

// ======================
// 🚀 Start HTTPS Server
// ======================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  const sslOptions = {
    key: fs.readFileSync(path.resolve("ssl/key.pem")),
    cert: fs.readFileSync(path.resolve("ssl/cert.pem")),
  };

  https.createServer(sslOptions, app).listen(PORT, () => {
    console.log(` HTTPS Server running on https://localhost:${PORT}`);
  });
}

export default app;
