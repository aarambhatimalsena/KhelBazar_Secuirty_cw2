import AuditLog from "../models/AuditLog.js";

export const writeAuditLog = async ({ user = null, action, req, metadata = {} }) => {
  try {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      "";

    await AuditLog.create({
      user,
      action,
      ipAddress: ip,
      userAgent: req.headers["user-agent"] || "",
      metadata,
    });
  } catch (err) {
    // don't break main flow if audit fails
    console.error("Audit log failed:", err.message);
  }
};

