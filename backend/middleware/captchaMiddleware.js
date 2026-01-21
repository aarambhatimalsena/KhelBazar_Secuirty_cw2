import axios from "axios";
import { writeAuditLog } from "../utils/audit.js";

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verifyTurnstileToken = async (token, req) => {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) {
    return { ok: false, errorCodes: ["missing_input"] };
  }

  try {
    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", token);
    if (req?.ip) params.append("remoteip", req.ip);

    const { data } = await axios.post(TURNSTILE_VERIFY_URL, params);
    if (!data?.success) {
      return { ok: false, errorCodes: data?.["error-codes"] || [] };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, errorCodes: ["request_failed"] };
  }
};

export const requireCaptcha = async (req, res, next) => {
  const captchaToken = req.body?.captchaToken;
  const result = await verifyTurnstileToken(captchaToken, req);

  if (!result.ok) {
    await writeAuditLog({
      user: null,
      action: "CAPTCHA_FAILED",
      req,
      metadata: {
        errorCodes: result.errorCodes || [],
        context: req.originalUrl,
      },
    });

    return res.status(403).json({ message: "Captcha verification failed." });
  }

  return next();
};
