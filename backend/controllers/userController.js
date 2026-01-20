// controllers/userController.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import {
  sendForgotPasswordEmail,
  sendOtpEmail,
  sendEmailVerificationOtp,
  sendSuspiciousLoginEmail,
  sendNewLoginEmail,
} from "../utils/emailSender.js";
import asyncHandler from "express-async-handler";
import cloudinary from "../config/cloudinary.js";
import Otp from "../models/Otp.js";
import TrustedDevice from "../models/TrustedDevice.js";
import geoip from "geoip-lite";
import { hashOtp, isOtpMatch } from "../utils/otp.js";

// ✅ audit logging helper
import { writeAuditLog } from "../utils/audit.js";

// ✅ CSRF (double-submit)
import {
  issueCsrfToken,
  clearCsrfToken,
} from "../middleware/csrfMiddleware.js";
import { verifyTurnstileToken } from "../middleware/captchaMiddleware.js";
import { sanitizeText } from "../utils/sanitize.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 2FA config
const ALWAYS_REQUIRE_2FA = true;
const LOGIN_CHALLENGE_SECRET =
  process.env.LOGIN_CHALLENGE_SECRET || "login_challenge_dev_secret";
const OTP_PURPOSE_LOGIN_2FA = "login_2fa";
const OTP_PURPOSE_EMAIL_VERIFY = "email_verify";
const EMAIL_VERIFY_MAX_ATTEMPTS = 5;

// Helper: set secure httpOnly cookie (JWT stored here)
const setAuthCookie = (res, token) => {
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// ✅ Generate JWT Token with role
export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "admin",
      tokenVersion: user.tokenVersion || 0,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ========= 2FA & SUSPICIOUS HELPERS =========

// ?. Normalize IP (strip IPv6-mapped IPv4)
const normalizeIp = (ip) => {
  if (!ip) return "";
  return ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;
};

// ?. Soft IP (reduce false positives)
const toSoftIp = (ip) => {
  const cleanIp = normalizeIp(ip);
  if (!cleanIp) return "";

  if (cleanIp.includes(":")) {
    const parts = cleanIp.split(":").filter(Boolean);
    const head = parts.slice(0, 4).join(":");
    return head ? `${head}::` : cleanIp;
  }

  const octets = cleanIp.split(".");
  if (octets.length === 4) {
    return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
  }

  return cleanIp;
};

// ?. Basic UA parsing for email hints
const parseUserAgentInfo = (userAgent) => {
  const ua = userAgent || "";
  let browser = "Unknown";
  let os = "Unknown";

  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua) || /Opera/.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua) && /Version\//.test(ua) && !/Chrome\//.test(ua))
    browser = "Safari";

  if (/Windows NT/.test(ua)) os = "Windows";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return { browser, os };
};

// ?. Client IP helper
const getClientIp = (req) => {
  const forwarded =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "";
  const rawIp = forwarded || req.ip || req.connection?.remoteAddress || "";
  return normalizeIp(rawIp);
};

// ?. Device fingerprint (hash)
const buildDeviceFingerprint = (req, ip, userAgentOverride = "") => {
  const ua = userAgentOverride || req.headers["user-agent"] || "";
  const acceptLang = req.headers["accept-language"] || "";
  const platformHeader = req.headers["sec-ch-ua-platform"] || "";
  const { os } = parseUserAgentInfo(ua);
  const softIp = toSoftIp(ip);
  const raw = `${ua}::${acceptLang}::${platformHeader || os}::${softIp}`;
  return crypto.createHash("sha256").update(raw).digest("hex");
};

// ✅ Geo extraction with geoip-lite + headers
const extractGeoInfo = (req, ip) => {
  let country =
    req.headers["x-user-country"] || req.headers["cf-ipcountry"] || null;

  let city = req.headers["x-user-city"] || req.headers["cf-city"] || null;

  let effectiveIp =
    ip ||
    req.ip ||
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection?.remoteAddress ||
    "";

  if (
    effectiveIp === "::1" ||
    effectiveIp === "127.0.0.1" ||
    effectiveIp === "::ffff:127.0.0.1"
  ) {
    return {
      country: country || "LOCAL",
      city: city || "LOCALHOST",
    };
  }

  if ((!country || !city) && effectiveIp) {
    try {
      const lookup = geoip.lookup(effectiveIp);
      if (lookup) {
        if (!country && lookup.country) country = lookup.country;
        if (!city && lookup.city) city = lookup.city;
      }
    } catch (e) {
      console.error("geoip-lite lookup failed:", e.message);
    }
  }

  return {
    country: country || "UNKNOWN",
    city: city || "UNKNOWN",
  };
};

// 🔍 Evaluate suspicious login (device + geo + attempts)
const evaluateLoginRisk = (user, ip, userAgent, deviceHash, country, city) => {
  const reasons = [];
  let suspicious = false;
  let score = 0;

  if (!user.lastLoginAt) return { suspicious: false, score, reasons };

  if (user.lastLoginIp && user.lastLoginIp !== ip) {
    suspicious = true;
    score += 30;
    reasons.push("New IP address");
  }

  if (user.lastLoginUserAgent && user.lastLoginUserAgent !== userAgent) {
    suspicious = true;
    score += 25;
    reasons.push("New browser / device");
  }

  if (user.lastLoginDeviceHash && user.lastLoginDeviceHash !== deviceHash) {
    suspicious = true;
    score += 25;
    reasons.push("New device fingerprint");
  }

  if (user.lastLoginCountry && user.lastLoginCountry !== country) {
    suspicious = true;
    score += 30;
    reasons.push("Login from new country");
  }

  if (user.lastLoginCity && user.lastLoginCity !== city) {
    suspicious = true;
    score += 10;
    reasons.push("Login from new city");
  }

  if (user.loginAttempts >= 3) {
    suspicious = true;
    score += 20;
    reasons.push("Multiple failed login attempts before success");
  }

  if (score > 100) score = 100;

  return { suspicious, score, reasons };
};

// short-lived login challenge token (10 min)
const createLoginChallengeToken = (userId, ip, userAgent) =>
  jwt.sign(
    { id: userId, ip, ua: userAgent, type: "LOGIN_CHALLENGE" },
    LOGIN_CHALLENGE_SECRET,
    { expiresIn: "10m" }
  );

// ?. Trusted device tracking (first-time device only)
const upsertTrustedDevice = async (user, req, clientInfo) => {
  const { ip, userAgent, country, city, deviceHash } = clientInfo;
  const acceptLanguage = req.headers["accept-language"] || "";
  const platform = req.headers["sec-ch-ua-platform"] || "";
  const { browser, os } = parseUserAgentInfo(userAgent || "");

  const existing = await TrustedDevice.findOne({
    user: user._id,
    deviceHash,
    revoked: false,
  });

  if (existing) {
    existing.lastSeenAt = new Date();
    existing.lastIp = ip || existing.lastIp;
    existing.lastCountry = country || existing.lastCountry;
    existing.lastCity = city || existing.lastCity;
    existing.userAgent = userAgent || existing.userAgent;
    existing.browser = browser || existing.browser;
    existing.os = os || existing.os;
    existing.acceptLanguage = acceptLanguage || existing.acceptLanguage;
    existing.platform = platform || existing.platform;
    await existing.save();

    return { isNew: false, browser, os };
  }

  await TrustedDevice.create({
    user: user._id,
    deviceHash,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    lastIp: ip || "",
    lastCountry: country || "",
    lastCity: city || "",
    userAgent: userAgent || "",
    browser,
    os,
    acceptLanguage,
    platform,
    revoked: false,
  });

  return { isNew: true, browser, os };
};
// 6 digit numeric OTP
const generateNumericOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ========================
// 🔹 Normal Register (NO auto-login)
// ========================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { value: cleanName, modified: nameModified } = sanitizeText(
      name,
      100
    );

    if (!cleanName || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required.",
      });
    }

    if (nameModified) {
      await writeAuditLog({
        user: null,
        action: "XSS_BLOCKED",
        req,
        metadata: { field: "name", route: "register" },
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      await writeAuditLog({
        user: null,
        action: "REGISTER_EMAIL_EXISTS",
        req,
        metadata: { email },
      });

      return res.status(409).json({
        message:
          "An account with this email already exists. Please login instead.",
      });
    }

    const passwordCheck = User.evaluatePassword(password, {
      name: cleanName,
      email,
    });
    if (!passwordCheck.ok) {
      return res.status(400).json({ message: passwordCheck.reason });
    }

    const user = await User.create({
      name: cleanName,
      email,
      password,
      isOtpUser: false,
      isGoogleUser: false,
      isEmailVerified: false,
    });

    // Send email verification OTP
    const otpCode = generateNumericOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.deleteMany({ email: user.email, purpose: OTP_PURPOSE_EMAIL_VERIFY });
    await Otp.create({
      email: user.email,
      otpHash: hashOtp(otpCode),
      expiresAt,
      purpose: OTP_PURPOSE_EMAIL_VERIFY,
      attempts: 0,
    });
    await sendEmailVerificationOtp(user.email, otpCode);

    await writeAuditLog({
      user: user._id,
      action: "REGISTER_SUCCESS",
      req,
      metadata: { email: user.email },
    });

    return res.status(201).json({
      message: "Registration successful. Please verify your email to continue.",
      verificationRequired: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.role === "admin",
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("❌ Register Error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

// ========================
// 🔹 Login (lockout + 2FA + suspicious detection + password expiry)
// ========================
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const genericError = { message: "Invalid email or password." };

  try {
    const user = await User.findOne({ email });

    if (!user) {
      await writeAuditLog({
        user: null,
        action: "LOGIN_FAILED_NOUSER",
        req,
        metadata: { email },
      });
      return res.status(401).json(genericError);
    }

    if (user.isActive === false) {
      await writeAuditLog({
        user: user._id,
        action: "LOGIN_BLOCKED_DEACTIVATED",
        req,
        metadata: { email: user.email },
      });

      return res.status(403).json({
        message: "This account has been disabled. Please contact support.",
      });
    }

    if (user.isLocked()) {
      let remainingMs = 0;
      if (user.lockUntil) {
        remainingMs = user.lockUntil.getTime() - Date.now();
        if (remainingMs < 0) remainingMs = 0;
      }
      const remainingSeconds = Math.floor(remainingMs / 1000);

      await writeAuditLog({
        user: user._id,
        action: "LOGIN_BLOCKED_LOCKED",
        req,
        metadata: {
          email: user.email,
          lockUntil: user.lockUntil,
          remainingMs,
          remainingSeconds,
        },
      });

      res.set("Retry-After", String(remainingSeconds));
      return res.status(423).json({
        message:
          "Your account is temporarily locked due to multiple failed attempts.",
        lockUntil: user.lockUntil,
        remainingMs,
        remainingSeconds,
      });
    }

    if (!user.isEmailVerified) {
      await writeAuditLog({
        user: user._id,
        action: "LOGIN_BLOCKED_EMAIL_UNVERIFIED",
        req,
        metadata: { email: user.email },
      });

      return res.status(403).json({
        message: "Email not verified. Please verify your email first.",
      });
    }

    if (user.loginAttempts >= 3) {
      const captchaToken = req.body?.captchaToken;
      const captchaResult = await verifyTurnstileToken(captchaToken, req);

      if (!captchaResult.ok) {
        await writeAuditLog({
          user: user._id,
          action: "CAPTCHA_FAILED",
          req,
          metadata: {
            errorCodes: captchaResult.errorCodes || [],
            context: "login",
            email: user.email,
          },
        });

        return res
          .status(403)
          .json({ message: "Captcha verification failed." });
      }
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      const { lockedNow, lockUntil } = await user.registerFailedLogin();

      await writeAuditLog({
        user: user._id,
        action: "LOGIN_FAILED_BAD_PASSWORD",
        req,
        metadata: { email: user.email, loginAttempts: user.loginAttempts },
      });

      if (lockedNow && lockUntil) {
        let remainingMs = lockUntil.getTime() - Date.now();
        if (remainingMs < 0) remainingMs = 0;
        const remainingSeconds = Math.floor(remainingMs / 1000);

        await writeAuditLog({
          user: user._id,
          action: "LOGIN_BRUTE_FORCE_LOCK",
          req,
          metadata: {
            email: user.email,
            lockUntil,
            remainingMs,
            remainingSeconds,
          },
        });

        res.set("Retry-After", String(remainingSeconds));
        return res.status(423).json({
          message:
            "Your account is temporarily locked due to multiple failed attempts.",
          lockUntil,
          remainingMs,
          remainingSeconds,
        });
      }

      return res.status(401).json(genericError);
    }

    // ✅ Password expiry enforcement
    if (typeof user.isPasswordExpired === "function" && user.isPasswordExpired()) {
      await writeAuditLog({
        user: user._id,
        action: "LOGIN_BLOCKED_PASSWORD_EXPIRED",
        req,
        metadata: { email: user.email },
      });

      return res.status(403).json({
        message: "Password expired. Please reset your password.",
        passwordExpired: true,
      });
    }

    // Gather context
    const ip = getClientIp(req);
    const ua = req.headers["user-agent"] || "";
    const { country, city } = extractGeoInfo(req, ip);
    const deviceHash = buildDeviceFingerprint(req, ip, ua);

    const { suspicious, score, reasons } = evaluateLoginRisk(
      user,
      ip,
      ua,
      deviceHash,
      country,
      city
    );

    const needs2FA = ALWAYS_REQUIRE_2FA || suspicious;

    // ✅ 2FA flow
    if (needs2FA) {
      const otpCode = generateNumericOtp();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await Otp.deleteMany({ email: user.email, purpose: OTP_PURPOSE_LOGIN_2FA });
      await Otp.create({
        email: user.email,
        otpHash: hashOtp(otpCode),
        expiresAt,
        purpose: OTP_PURPOSE_LOGIN_2FA,
        attempts: 0,
      });

      try {
        await sendOtpEmail(user.email, otpCode);
      } catch (e) {
        await writeAuditLog({
          user: user._id,
          action: "LOGIN_2FA_CHALLENGE_SEND_FAILED",
          req,
          metadata: { email: user.email, error: e.message },
        });
        return res
          .status(500)
          .json({ message: "Failed to send login verification code." });
      }

      if (suspicious) {
        try {
          await sendSuspiciousLoginEmail(
            user,
            { ip, userAgent: ua, country, city },
            reasons,
            score
          );
          user.flaggedForReview = true;
          await user.registerSuspiciousLogin();
        } catch (err) {
          console.error("❌ Suspicious login email failed:", err.message);
        }
      }

      user.loginHistory.push({
        ip,
        userAgent: ua,
        deviceHash,
        country,
        city,
        time: new Date(),
        suspicious,
        reason: reasons.join(", "),
        riskScore: score,
      });
      await user.save();

      const challengeToken = createLoginChallengeToken(user._id, ip, ua);

      await writeAuditLog({
        user: user._id,
        action: "LOGIN_2FA_CHALLENGE_SENT",
        req,
        metadata: {
          email: user.email,
          suspiciousLogin: suspicious,
          riskScore: score,
          riskReasons: reasons,
          country,
          city,
        },
      });

      return res.status(200).json({
        message:
          "We sent a verification code to your email. Please verify to complete login.",
        requires2FA: true,
        challengeToken,
        suspiciousLogin: suspicious,
        riskReasons: reasons,
        riskScore: score,
      });
    }

    // ✅ normal login
    await user.registerSuccessfulLogin(ip, ua);

    user.lastLoginDeviceHash = deviceHash;
    user.lastLoginCountry = country;
    user.lastLoginCity = city;

    user.loginHistory.push({
      ip,
      userAgent: ua,
      deviceHash,
      country,
      city,
      time: new Date(),
      suspicious,
      reason: reasons.join(", "),
      riskScore: score,
    });

    if (suspicious) {
      await user.registerSuspiciousLogin();
      user.flaggedForReview = true;
      try {
        await sendSuspiciousLoginEmail(
          user,
          { ip, userAgent: ua, country, city },
          reasons,
          score
        );
      } catch (err) {
        console.error("❌ Suspicious login email failed:", err.message);
      }
    } else {
      await user.resetSuspiciousStats();
    }

    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);
    issueCsrfToken(res); // ? NEW

    try {
      const { isNew, browser, os } = await upsertTrustedDevice(user, req, {
        ip,
        userAgent: ua,
        country,
        city,
        deviceHash,
      });

      if (isNew) {
        await sendNewLoginEmail(user, {
          ip,
          userAgent: ua,
          country,
          city,
          browser,
          os,
          time: new Date(),
        });
      }
    } catch (err) {
      console.error("Trusted device tracking failed:", err?.message || err);
    }
    await writeAuditLog({
      user: user._id,
      action: "LOGIN_SUCCESS",
      req,
      metadata: {
        email: user.email,
        suspiciousLogin: suspicious,
        riskScore: score,
        riskReasons: reasons,
        country,
        city,
      },
    });

    // ✅ Cookie-only: no token returned to frontend
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
      profileImage: user.profileImage,
      suspiciousLogin: suspicious,
      riskReasons: reasons,
      riskScore: score,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

// ========================
// 🔹 Verify Login 2FA OTP
// ========================
export const verifyLogin2FA = async (req, res) => {
  const { otp, challengeToken } = req.body;

  if (!otp || !challengeToken) {
    return res
      .status(400)
      .json({ message: "OTP code and challenge token are required." });
  }

  try {
    let payload;
    try {
      payload = jwt.verify(challengeToken, LOGIN_CHALLENGE_SECRET);
    } catch (err) {
      await writeAuditLog({
        user: null,
        action: "LOGIN_2FA_FAILED_CHALLENGE_INVALID",
        req,
        metadata: { error: err.message },
      });

      return res
        .status(400)
        .json({ message: "Invalid or expired login verification session." });
    }

    if (payload.type !== "LOGIN_CHALLENGE" || !payload.id) {
      await writeAuditLog({
        user: null,
        action: "LOGIN_2FA_FAILED_CHALLENGE_INVALID",
        req,
        metadata: {},
      });

      return res.status(400).json({ message: "Invalid login challenge token." });
    }

    const user = await User.findById(payload.id);
    if (!user) {
      await writeAuditLog({
        user: null,
        action: "LOGIN_2FA_FAILED_USER_NOT_FOUND",
        req,
        metadata: { id: payload.id },
      });

      return res.status(404).json({ message: "User not found." });
    }

    const otpDoc = await Otp.findOne({
      email: user.email,
      purpose: OTP_PURPOSE_LOGIN_2FA,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      await writeAuditLog({
        user: user._id,
        action: "LOGIN_2FA_FAILED_OTP_MISSING_OR_EXPIRED",
        req,
        metadata: { email: user.email },
      });

      return res.status(400).json({ message: "Verification code expired or not found." });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });

      await writeAuditLog({
        user: user._id,
        action: "LOGIN_2FA_FAILED_OTP_EXPIRED",
        req,
        metadata: { email: user.email },
      });

      return res.status(400).json({ message: "Verification code has expired. Please login again." });
    }

    if (!isOtpMatch(otp, otpDoc.otpHash)) {
      await writeAuditLog({
        user: user._id,
        action: "LOGIN_2FA_FAILED_OTP_INVALID",
        req,
        metadata: { email: user.email },
      });

      return res.status(400).json({ message: "Invalid verification code." });
    }

    await Otp.deleteOne({ _id: otpDoc._id });

    const ip = normalizeIp(payload.ip) || getClientIp(req);
    const ua = payload.ua || req.headers["user-agent"] || "";
    const { country, city } = extractGeoInfo(req, ip);
    const deviceHash = buildDeviceFingerprint(req, ip, ua);

    const { suspicious, score, reasons } = evaluateLoginRisk(
      user,
      ip,
      ua,
      deviceHash,
      country,
      city
    );

    await user.registerSuccessfulLogin(ip, ua);

    user.lastLoginDeviceHash = deviceHash;
    user.lastLoginCountry = country;
    user.lastLoginCity = city;

    user.loginHistory.push({
      ip,
      userAgent: ua,
      deviceHash,
      country,
      city,
      time: new Date(),
      suspicious,
      reason: reasons.join(", "),
      riskScore: score,
    });

    if (suspicious) {
      await user.registerSuspiciousLogin();
      user.flaggedForReview = true;
      try {
        await sendSuspiciousLoginEmail(
          user,
          { ip, userAgent: ua, country, city },
          reasons,
          score
        );
      } catch (err) {
        console.error("❌ Suspicious login email failed:", err.message);
      }
    } else {
      await user.resetSuspiciousStats();
    }

    await user.save();

    const token = generateToken(user);
    setAuthCookie(res, token);
    issueCsrfToken(res); // ✅ NEW

    try {
      const { isNew, browser, os } = await upsertTrustedDevice(user, req, {
        ip,
        userAgent: ua,
        country,
        city,
        deviceHash,
      });

      if (isNew) {
        await sendNewLoginEmail(user, {
          ip,
          userAgent: ua,
          country,
          city,
          browser,
          os,
          time: new Date(),
        });
      }
    } catch (err) {
      console.error("Trusted device tracking failed:", err?.message || err);
    }

    await writeAuditLog({
      user: user._id,
      action: "LOGIN_2FA_SUCCESS",
      req,
      metadata: {
        email: user.email,
        suspiciousLogin: suspicious,
        riskScore: score,
        riskReasons: reasons,
        country,
        city,
      },
    });

    // ✅ Cookie-only: no token returned
    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
      profileImage: user.profileImage,
      suspiciousLogin: suspicious,
      riskReasons: reasons,
      riskScore: score,
    });
  } catch (error) {
    console.error("❌ verifyLogin2FA Error:", error);
    return res.status(500).json({ message: "2FA verification failed" });
  }
};

// ========================
// 🔹 Google Auth
// ========================
// ========================
// ✅ Email Verification OTP (Send / Verify)
// ========================
export const sendVerificationOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "If an account exists, a verification code has been sent." });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email is already verified." });
    }

    const otpCode = generateNumericOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email: user.email, purpose: OTP_PURPOSE_EMAIL_VERIFY });
    await Otp.create({
      email: user.email,
      otpHash: hashOtp(otpCode),
      expiresAt,
      purpose: OTP_PURPOSE_EMAIL_VERIFY,
      attempts: 0,
    });

    await sendEmailVerificationOtp(user.email, otpCode);

    return res.status(200).json({
      message: "Verification code sent to your email.",
    });
  } catch (error) {
    console.error("❌ sendVerificationOtp Error:", error);
    return res.status(500).json({ message: "Failed to send verification code." });
  }
};

export const verifyEmailOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification request." });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Email already verified." });
    }

    const otpDoc = await Otp.findOne({
      email: user.email,
      purpose: OTP_PURPOSE_EMAIL_VERIFY,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ message: "Verification code not found." });
    }

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(400).json({ message: "Verification code expired." });
    }

    if (otpDoc.attempts >= EMAIL_VERIFY_MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: otpDoc._id });
      return res.status(429).json({
        message: "Too many attempts. Please request a new verification code.",
      });
    }

    if (!isOtpMatch(otp.trim(), otpDoc.otpHash)) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      return res.status(400).json({ message: "Invalid verification code." });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    await Otp.deleteOne({ _id: otpDoc._id });

    return res.status(200).json({ message: "Email verified successfully." });
  } catch (error) {
    console.error("❌ verifyEmailOtp Error:", error);
    return res.status(500).json({ message: "Email verification failed." });
  }
};

// ========================
// dY"1 Google Auth
// ========================
export const googleAuthController = async (req, res) => {
  const token = req.body?.token || req.body?.credential;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { name, email, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: googleId,
        isGoogleUser: true,
        isOtpUser: false,
        isEmailVerified: true,
      });

      await writeAuditLog({
        user: user._id,
        action: "GOOGLE_REGISTER_SUCCESS",
        req,
        metadata: { email: user.email },
      });
    }

    const jwtToken = generateToken(user);
    setAuthCookie(res, jwtToken);
    issueCsrfToken(res); // ✅ NEW

    await writeAuditLog({
      user: user._id,
      action: "GOOGLE_LOGIN_SUCCESS",
      req,
      metadata: { email: user.email },
    });

    // ✅ Cookie-only: no token returned
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.role === "admin",
      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("❌ Google Auth Error:", error);

    await writeAuditLog({
      user: null,
      action: "GOOGLE_LOGIN_FAILED",
      req,
      metadata: { error: error.message },
    });

    return res.status(401).json({ message: "Google authentication failed" });
  }
};

// ========================
// 🔹 Get Profile
// ========================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("❌ Get Profile Error:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ========================
// 🔹 Update Profile (password reuse prevention)
// ========================
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let effectiveName = user.name;
    if (req.body.name) {
      const { value: cleanName, modified: nameModified } = sanitizeText(
        req.body.name,
        100
      );
      if (!cleanName) {
        return res.status(400).json({ message: "Invalid name." });
      }
      if (nameModified) {
        await writeAuditLog({
          user: user._id,
          action: "XSS_BLOCKED",
          req,
          metadata: { field: "name", route: "profile_update" },
        });
      }
      user.name = cleanName;
      effectiveName = cleanName;
    }
    const effectiveEmail = req.body.email || user.email;
    user.email = effectiveEmail;
    let passwordChanged = false;

    if (req.body.password && req.body.password.trim() !== "") {
      const passwordCheck = User.evaluatePassword(req.body.password, {
        name: effectiveName,
        email: effectiveEmail,
      });
      if (!passwordCheck.ok) {
        return res.status(400).json({ message: passwordCheck.reason });
      }

      if (
        typeof user.isPasswordReused === "function" &&
        (await user.isPasswordReused(req.body.password))
      ) {
        await writeAuditLog({
          user: user._id,
          action: "PASSWORD_REUSE_BLOCKED",
          req,
          metadata: {
            userId: user._id,
            email: user.email,
            reason: "matched passwordHistory",
            source: "profile",
          },
        });
        return res.status(400).json({
          message: "You cannot reuse your recent passwords.",
        });
      }

      user.password = req.body.password;
      user.tokenVersion = (user.tokenVersion || 0) + 1;
      passwordChanged = true;
    }

    const updatedUser = await user.save();

    if (passwordChanged) {
      res.clearCookie("accessToken", {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
      clearCsrfToken(res);
    } else {
      const newToken = generateToken(updatedUser);
      setAuthCookie(res, newToken);
      issueCsrfToken(res); // ✅ keep csrf fresh
    }

    await writeAuditLog({
      user: updatedUser._id,
      action: "PROFILE_UPDATED",
      req,
      metadata: {
        changedEmail: !!req.body.email,
        changedName: !!req.body.name,
        changedPassword: !!req.body.password,
      },
    });

    if (passwordChanged) {
      await writeAuditLog({
        user: updatedUser._id,
        action: "PASSWORD_CHANGED",
        req,
        metadata: {},
      });
      await writeAuditLog({
        user: updatedUser._id,
        action: "SESSIONS_REVOKED",
        req,
        metadata: { reason: "password_change" },
      });
    }

    return res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.role === "admin",
      profileImage: updatedUser.profileImage,
    });
  } catch (error) {
    console.error("❌ Update Profile Error:", error);
    return res.status(500).json({ message: "Profile update failed" });
  }
};

// ========================
// Forgot Password

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      await writeAuditLog({
        user: null,
        action: "PASSWORD_RESET_REQUESTED_NOUSER",
        req,
        metadata: { email },
      });

      return res.status(200).json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashed = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashed;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    await sendForgotPasswordEmail(user.email, resetUrl);

    await writeAuditLog({
      user: user._id,
      action: "PASSWORD_RESET_REQUESTED",
      req,
      metadata: { email: user.email },
    });

    return res.status(200).json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("❌ Forgot Password Error:", error);

    await writeAuditLog({
      user: null,
      action: "PASSWORD_RESET_REQUEST_FAILED",
      req,
      metadata: { error: error.message },
    });

    return res.status(500).json({ message: "Failed to process password reset" });
  }
};

// ========================
// 🔹 Reset Password (reuse prevention)
  export const resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;

      const hashed = crypto.createHash("sha256").update(token).digest("hex");
      const user = await User.findOne({
        resetPasswordToken: hashed,
        resetPasswordExpires: { $gt: Date.now() },
      });

    if (!user) {
      await writeAuditLog({
        user: null,
        action: "PASSWORD_RESET_FAILED_TOKEN_INVALID",
        req,
        metadata: {},
      });

        return res
          .status(400)
          .json({ message: "Invalid or expired password reset token." });
      }

      const passwordCheck = User.evaluatePassword(password, {
        name: user.name,
        email: user.email,
      });
      if (!passwordCheck.ok) {
        return res.status(400).json({ message: passwordCheck.reason });
      }

      if (
        typeof user.isPasswordReused === "function" &&
        (await user.isPasswordReused(password))
      ) {
      await writeAuditLog({
        user: user._id,
        action: "PASSWORD_REUSE_BLOCKED",
        req,
        metadata: {
          userId: user._id,
          email: user.email,
          reason: "matched passwordHistory",
          source: "reset",
        },
      });
      return res.status(400).json({
        message: "You cannot reuse your recent passwords.",
      });
    }

    user.password = password;
    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    await writeAuditLog({
      user: user._id,
      action: "PASSWORD_RESET_SUCCESS",
      req,
      metadata: { email: user.email },
    });

    await writeAuditLog({
      user: user._id,
      action: "PASSWORD_CHANGED",
      req,
      metadata: { via: "reset" },
    });

    await writeAuditLog({
      user: user._id,
      action: "SESSIONS_REVOKED",
      req,
      metadata: { reason: "password_reset" },
    });

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ Reset Password Error:", error);

    await writeAuditLog({
      user: null,
      action: "PASSWORD_RESET_FAILED",
      req,
      metadata: { error: error.message },
    });

    return res.status(500).json({ message: "Failed to reset password" });
  }
};

// ========================
// 🔹 Upload Profile Image
// ========================
export const uploadProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No image file uploaded");
  }

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "profile_images",
  });

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.profileImage = result.secure_url;
  await user.save();

  const newToken = generateToken(user);
  setAuthCookie(res, newToken);
  issueCsrfToken(res); // ✅ keep csrf fresh

  await writeAuditLog({
    user: user._id,
    action: "PROFILE_IMAGE_UPLOADED",
    req,
    metadata: { profileImage: user.profileImage },
  });

  return res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    isAdmin: user.role === "admin",
    profileImage: user.profileImage,
  });
});

// ========================
// 🔹 Logout
// ========================
export const logoutUser = async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  clearCsrfToken(res); // ✅ NEW

  await writeAuditLog({
    user: req.user?.id || null,
    action: "LOGOUT",
    req,
    metadata: {},
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

// ========================
// ✅ Logout all devices (revoke sessions)
// ========================
export const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
    });
    clearCsrfToken(res);

    await writeAuditLog({
      user: req.user?.id || null,
      action: "LOGOUT_ALL_DEVICES",
      req,
      metadata: {},
    });

    return res.status(200).json({
      message: "All sessions revoked. Please log in again.",
    });
  } catch (error) {
    console.error("Logout all devices error:", error);
    return res.status(500).json({ message: "Failed to logout all devices" });
  }
};
