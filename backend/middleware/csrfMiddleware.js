import crypto from "crypto";
import { writeAuditLog } from "../utils/audit.js";

// ?. set csrfToken cookie (frontend can read)
export const issueCsrfToken = (res) => {
  const token = crypto.randomBytes(24).toString("hex");

  res.cookie("csrfToken", token, {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
    maxAge: 2 * 60 * 60 * 1000, // 2 hours
  });

  return token;
};

export const clearCsrfToken = (res) => {
  res.clearCookie("csrfToken", {
    httpOnly: false,
    secure: true,
    sameSite: "strict",
  });
};

const isUnsafeMethod = (method) =>
  ["post", "put", "patch", "delete"].includes(method?.toLowerCase());

const isExemptPath = (path) => {
  const exemptions = [
    "/api/users/login",
    "/api/users/register",
    "/api/users/send-verification-otp",
    "/api/users/verify-email-otp",
    "/api/users/google-auth",
    "/api/users/forgot-password",
    "/api/users/reset-password",
    "/api/users/login/2fa-verify",
  ];

  return exemptions.some((exempt) => path.startsWith(exempt));
};

const validateCsrf = (req) => {
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.headers["x-csrf-token"];
  return !!cookieToken && !!headerToken && cookieToken === headerToken;
};

// ?. validate csrf: cookie must match header
export const requireCsrf = (req, res, next) => {
  if (!validateCsrf(req)) {
    writeAuditLog({
      user: req.user?._id || req.user?.id || null,
      action: "CSRF_FAILED",
      req,
      metadata: { path: req.originalUrl },
    });
    return res.status(403).json({ message: "CSRF validation failed" });
  }
  return next();
};

// ?. Apply to unsafe routes except auth bootstrap endpoints
export const requireCsrfUnlessExempt = (req, res, next) => {
  if (!isUnsafeMethod(req.method)) return next();
  if (isExemptPath(req.originalUrl || "")) return next();
  return requireCsrf(req, res, next);
};
