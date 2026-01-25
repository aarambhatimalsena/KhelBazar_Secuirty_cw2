import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../auth/AuthProvider";
import toast from "react-hot-toast";
import InlineAlert from "../common/InlineAlert";
import { GoogleLogin } from "@react-oauth/google";
import {
  loginUserService,
  googleLoginService,
  verifyLogin2FAService, // 👈 NEW service
} from "../../services/authService";

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [lastError, setLastError] = useState("");
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const lockStorageKey = "loginLockUntil";

  // 🔐 lock states
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState(null); // ISO string
  const [lockCountdown, setLockCountdown] = useState(null); // ms remaining

  // 🔐 2FA states
  const [is2FAMode, setIs2FAMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [challengeToken, setChallengeToken] = useState(null);

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

  const baseInput =
    "w-full rounded-xl px-4 py-3 text-sm border bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-[#0f6b6f] focus:border-transparent transition-all";
  const inputClass = `${baseInput} border-gray-200`;

  const resetCaptcha = () => {
    setCaptchaToken("");
    if (window.turnstile && turnstileWidgetId.current !== null) {
      window.turnstile.reset(turnstileWidgetId.current);
    }
  };

  const renderTurnstile = () => {
    if (!turnstileSiteKey || !turnstileRef.current || !window.turnstile) return;

    if (turnstileWidgetId.current !== null) {
      window.turnstile.reset(turnstileWidgetId.current);
      return;
    }

    turnstileWidgetId.current = window.turnstile.render(turnstileRef.current, {
      sitekey: turnstileSiteKey,
      callback: (token) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => setCaptchaToken(""),
    });
  };

  useEffect(() => {
    if (!captchaRequired || !turnstileSiteKey) return;

    if (window.turnstile) {
      renderTurnstile();
      return;
    }

    const scriptSrc =
      "https://challenges.cloudflare.com/turnstile/v0/api.js";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    const handleLoad = () => renderTurnstile();

    if (!existing) {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.onload = handleLoad;
      document.body.appendChild(script);
      return () => {
        script.onload = null;
      };
    }

    existing.addEventListener("load", handleLoad);
    return () => existing.removeEventListener("load", handleLoad);
  }, [captchaRequired, turnstileSiteKey]);

  useEffect(() => {
    const storedLockUntil = localStorage.getItem(lockStorageKey);
    if (!storedLockUntil) return;

    const diff = new Date(storedLockUntil).getTime() - Date.now();
    if (diff > 0) {
      setIsLocked(true);
      setLockUntil(storedLockUntil);
      setLockCountdown(diff);
    } else {
      localStorage.removeItem(lockStorageKey);
    }
  }, []);


  // 🕒 15 minute countdown logic
  useEffect(() => {
    if (!isLocked || !lockUntil) return;

    const tick = () => {
      const diff = new Date(lockUntil).getTime() - Date.now();

      if (diff <= 0) {
        setIsLocked(false);
        setLockUntil(null);
        setLockCountdown(null);
        localStorage.removeItem(lockStorageKey);
        return;
      }

      setLockCountdown(diff);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

  const formatCountdown = (ms) => {
    if (!ms || ms <= 0) return "0:00";
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // 🔓 final success login handler (both normal + 2FA)
  const handleLoginSuccess = async (data) => {
    let profile = null;

    try {
      profile = await login();
    } catch {
      profile = null;
    }

    showToast("success", "Login successful!");
    resetCaptcha();
    setCaptchaRequired(false);
    setLastError("");

    const isAdmin =
      profile?.role === "admin" || profile?.isAdmin || !!data?.isAdmin;

    if (isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();

    if (isLocked) {
      showToast(
        "error",
        lockCountdown
          ? `Your account is locked. Try again in ${formatCountdown(
              lockCountdown
            )}.`
          : "Your account is currently locked. Please try again later."
      );
      return;
    }

    if (captchaRequired && !captchaToken) {
      showToast("error", "Please complete the captcha to continue.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await loginUserService({
        email,
        password,
        captchaToken: captchaToken || undefined,
      });

      // 🔐 2FA required flow
      if (data.requires2FA) {
        setIs2FAMode(true);
        setChallengeToken(data.challengeToken || null);
        setOtp("");
        showToast(
          "info",
          data.message ||
            "We've sent a verification code to your email. Please enter it below."
        );
        return;
      }

      // normal login
      await handleLoginSuccess(data);
    } catch (error) {
      const status = error?.response?.status;
      const resData = error?.response?.data || {};
      const backendMsg = resData.message || error?.message || "Login failed";
      const isCaptchaError = /captcha/i.test(backendMsg);

      if (backendMsg && backendMsg !== lastError) {
        resetCaptcha();
        setLastError(backendMsg);
      }

      if (status === 423) {
        console.log("423 lockout response:", resData);

        const backendUntil = resData.lockUntilNepal || resData.lockUntil;
        if (backendUntil) {
          const diff = new Date(backendUntil).getTime() - Date.now();
          setLockUntil(backendUntil);
          setLockCountdown(diff > 0 ? diff : 15 * 60 * 1000);
          localStorage.setItem(lockStorageKey, backendUntil);
        } else {
          const localUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          setLockUntil(localUntil);
          setLockCountdown(15 * 60 * 1000);
          localStorage.setItem(lockStorageKey, localUntil);
        }

        setIsLocked(true);

        showToast(
          "error",
          "Your account is temporarily locked due to multiple failed attempts."
        );
        return;
      }

      if (status === 429) {
        showToast("error", "Too many login attempts. Try again later.");
        return;
      }

      if (status === 403 && isCaptchaError) {
        setCaptchaRequired(true);
        resetCaptcha();
      }

      showToast("error", backendMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp || !challengeToken) {
      showToast("error", "Please enter the code sent to your email.");
      return;
    }

    setSubmitting(true);

    try {
      const data = await verifyLogin2FAService({ otp, challengeToken });
      // 2FA success = normal login complete
      await handleLoginSuccess(data);
      setIs2FAMode(false);
      setChallengeToken(null);
      setOtp("");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Verification failed. Please try again.";
      showToast("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      const data = await googleLoginService(googleToken);

      const profile = await login().catch(() => null);

      toast.success("Google login successful!");
      resetCaptcha();
      setCaptchaRequired(false);
      setLastError("");

      const isAdmin =
        profile?.role === "admin" || profile?.isAdmin || !!data?.isAdmin;

      if (isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Google login failed. Please try again.";
      toast.error(msg);
    }
  };

  const formattedNepalTime = lockUntil
    ? new Date(lockUntil).toLocaleTimeString("en-NP", {
        timeZone: "Asia/Kathmandu",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      {/* 🔒 Lock info + countdown */}
      {isLocked && (
        <div className="text-center text-xs sm:text-sm font-medium text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
          <div>Your account is locked due to multiple failed attempts.</div>

          {lockCountdown && lockCountdown > 0 && (
            <div className="text-[11px] text-teal-700 mt-1">
              Try again in{" "}
              <span className="font-semibold">
                {formatCountdown(lockCountdown)}
              </span>
            </div>
          )}

          {formattedNepalTime && (
            <div className="text-[11px] text-red-400 mt-0.5">
              Lock will end around{" "}
              <span className="font-semibold">{formattedNepalTime}</span>{" "}
              (Nepal time)
            </div>
          )}
        </div>
      )}

      {/* Card */}
      <div className="rounded-2xl border border-gray-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-white/80 backdrop-blur-sm p-6 sm:p-7">
        {!is2FAMode ? (
          // =====================
          // STEP 1: Email + Password
          // =====================
          <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                disabled={isLocked || submitting}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600 tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputClass}
                  disabled={isLocked || submitting}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLocked || submitting}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-[#0f6b6f] hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            {captchaRequired && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-medium text-gray-600 tracking-wide">
                  Verify you are human
                </label>
                <div
                  ref={turnstileRef}
                  className="rounded-lg border border-gray-200 bg-white p-3"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#0f6b6f] text-white py-3 rounded-xl font-semibold hover:bg-[#0b5559] hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={
                submitting || isLocked || (captchaRequired && !captchaToken)
              }
            >
              {isLocked
                ? lockCountdown
                  ? `Locked (${formatCountdown(lockCountdown)})`
                  : "Locked"
                : submitting
                ? "Signing in..."
                : "Sign in"}
            </button>
          </form>
        ) : (
          // =====================
          // STEP 2: OTP Verification
          // =====================
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-gray-600 mb-1">
              We’ve sent a 6-digit verification code to{" "}
              <span className="font-medium">{email}</span>. Enter it below to
              complete login.
            </p>

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
              className="w-full bg-[#0f6b6f] text-white py-3 rounded-xl font-semibold hover:bg-[#0b5559] hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? "Verifying..." : "Verify & Sign in"}
            </button>

            <button
              type="button"
              className="w-full text-xs text-gray-500 mt-2 underline"
              onClick={() => {
                // reset back to normal login
                setIs2FAMode(false);
                setChallengeToken(null);
                setOtp("");
              }}
              disabled={submitting}
            >
              ← Back to email & password
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-gray-400">
            or continue with
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Google Login */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => toast.error("Google login failed")}
          />
        </div>
      </div>

      {/* Footer link */}
      <p className="text-center text-sm text-gray-500">
        Don’t have an account?{" "}
        <Link
          to="/register"
          className="text-[#0f6b6f] font-medium hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
};

export default LoginForm;


