// controllers/otpController.js or wherever you have it
import Otp from "../models/Otp.js";
import { sendOtpEmail } from "../utils/emailSender.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { hashOtp, isOtpMatch } from "../utils/otp.js";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const GENERIC_PURPOSE = "generic";
const MAX_ATTEMPTS = 5;

//  /send-otp
export const sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const otp = generateOtp();

  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    await Otp.findOneAndUpdate(
      { email, purpose: GENERIC_PURPOSE },
      { otpHash: hashOtp(otp), expiresAt, purpose: GENERIC_PURPOSE, attempts: 0 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: "✅ OTP sent to your email!" });
  } catch (err) {
    res.status(500).json({ message: "❌ Failed to send OTP", error: err.message });
  }
};

//  /verify-otp
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required." });
  }

  try {
    const record = await Otp.findOne({ email, purpose: GENERIC_PURPOSE });

    if (!record) {
      return res.status(400).json({ message: "❌ OTP not found. Please request again." });
    }

    if (record.expiresAt < new Date()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "❌ OTP expired" });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(429).json({
        message: "❌ Too many attempts. Please request a new OTP.",
      });
    }

    if (!isOtpMatch(otp.trim(), record.otpHash)) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "❌ Invalid OTP" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name: email.split("@")[0],
        email,
        isOtpUser: true,
      });
      await user.save();
    }

    await Otp.deleteOne({ _id: record._id });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "❌ Server error", error: err.message });
  }
};
