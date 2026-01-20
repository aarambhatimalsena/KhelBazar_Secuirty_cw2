// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { writeAuditLog } from "../utils/audit.js";

// Helper: extract token from Authorization header OR httpOnly cookie
const getTokenFromReq = (req) => {
  let token = null;

  // 1) Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  // 2) Cookie: accessToken (httpOnly)
  if (!token && req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  return token;
};

// Authenticated user check
export const protect = async (req, res, next) => {
  try {
    const token = getTokenFromReq(req);

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Only select safe fields
    const user = await User.findById(decoded.id).select(
      "_id name email role isActive tokenVersion"
    );

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        message: "Account is disabled. Please contact support.",
      });
    }

    const decodedTokenVersion =
      typeof decoded.tokenVersion === "number" ? decoded.tokenVersion : null;

    if (decodedTokenVersion === null || decodedTokenVersion !== user.tokenVersion) {
      await writeAuditLog({
        user: user._id,
        action: "TOKEN_VERSION_MISMATCH",
        req,
        metadata: {
          tokenVersion: decoded.tokenVersion,
          currentTokenVersion: user.tokenVersion,
        },
      });

      return res.status(401).json({
        message: "Session revoked. Please log in again.",
      });
    }
    // Attach sanitized user object (support both id and _id)
    req.user = {
      _id: user._id, // ✅ so controllers can use req.user._id
      id: user._id,  // ✅ keep backward compatibility
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Optional: security context (for logging / suspicious detection)
    req.securityContext = {
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "unknown",
    };

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Session expired. Please log in again." });
    }

    return res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Role-based admin check
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied: Admins only" });
  }

  return next();
};

// ✅ Optional reusable role checker
export const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
