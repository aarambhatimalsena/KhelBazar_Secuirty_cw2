import React, { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import InlineAlert from "../components/common/InlineAlert";
import {
  sendVerificationOtpService,
  verifyEmailOtpService,
} from "../services/authService";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialEmail = useMemo(
    () => searchParams.get("email") || "",
    [searchParams]
  );

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const showToast = (type, message) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } max-w-sm mx-auto bg-white shadow-lg rounded-xl p-4`}
      >
        <InlineAlert type={type} message={message} />
      </div>
    ));
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!email || !otp) {
      showToast("error", "Email and verification code are required.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyEmailOtpService({ email, otp });
      showToast("success", "Email verified successfully! Please log in.");
      navigate("/login");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Verification failed. Please try again.";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast("error", "Please enter your email.");
      return;
    }

    setResending(true);
    try {
      const data = await sendVerificationOtpService(email);
      showToast("success", data?.message || "Verification code resent.");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Failed to resend verification code.";
      showToast("error", msg);
    } finally {
      setResending(false);
    }
  };

  const baseInput =
    "w-full rounded-xl px-4 py-3 text-sm border bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-[#0f6b6f] focus:border-transparent transition-all";
  const inputClass = `${baseInput} border-gray-200`;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      <div className="rounded-2xl border border-gray-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-white/80 backdrop-blur-sm p-6 sm:p-7">
        <h2 className="text-lg font-semibold text-gray-800">
          Verify your email
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Check your inbox for a 6-digit code.
        </p>

        <form onSubmit={handleVerify} className="space-y-4 mt-5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 tracking-wide">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
              disabled={submitting || resending}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 tracking-wide">
              Verification code
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className={inputClass}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#0f6b6f] text-white py-3 rounded-xl font-semibold hover:bg-[#0b5559] hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Verifying..." : "Verify email"}
          </button>
        </form>

        <button
          type="button"
          className="w-full text-xs text-gray-500 mt-3 underline"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? "Resending..." : "Resend verification code"}
        </button>

        <div className="text-center text-sm mt-6">
          <span className="text-gray-500">Already verified? </span>
          <Link to="/login" className="text-[#0f6b6f] font-medium hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
