import crypto from "crypto";

export const hashOtp = (otp) =>
  crypto.createHash("sha256").update(String(otp)).digest("hex");

export const isOtpMatch = (otp, otpHash) => {
  if (!otp || !otpHash) return false;
  const candidate = hashOtp(otp);
  const a = Buffer.from(candidate);
  const b = Buffer.from(otpHash);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};
