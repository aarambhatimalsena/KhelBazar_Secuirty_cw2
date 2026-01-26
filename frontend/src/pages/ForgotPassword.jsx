import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FiHome } from "react-icons/fi";
import Header from "../layouts/Header";
import { forgotPassword } from "../services/authService";
import InlineAlert from "../components/common/InlineAlert";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const turnstileRef = useRef(null);
  const turnstileWidgetId = useRef(null);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const showToast = (type, message) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? "animate-enter" : "animate-leave"
        } absolute top-4 right-4 z-50 max-w-sm w-full bg-white border-l-4 ${
          type === "error" ? "border-red-500" : "border-green-500"
        } shadow-lg rounded-lg`}
      >
        <InlineAlert type={type} message={message} />
      </div>
    ));
  };

  // simple email regex for frontend check
  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 frontend email validation
    if (!isValidEmail(email)) {
      showToast("error", "Please enter a valid email address.");
      return;
    }

    if (!captchaToken) {
      showToast("error", "Please complete the captcha to continue.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim(), captchaToken);

      // backend pani generic msg dincha → same style maintain
      showToast(
        "success",
        "If an account exists for this email, a reset link has been sent."
      );
      setEmail("");
      setCaptchaToken("");
      if (window.turnstile && turnstileWidgetId.current !== null) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
    } catch (err) {
      // still generic error, no enumeration
      showToast(
        "error",
        err?.response?.data?.message ||
          "Unable to process reset request at the moment."
      );
      setCaptchaToken("");
      if (window.turnstile && turnstileWidgetId.current !== null) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!turnstileSiteKey) return;

    if (window.turnstile) {
      if (turnstileWidgetId.current !== null) {
        window.turnstile.reset(turnstileWidgetId.current);
        return;
      }

      turnstileWidgetId.current = window.turnstile.render(
        turnstileRef.current,
        {
          sitekey: turnstileSiteKey,
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
          "error-callback": () => setCaptchaToken(""),
        }
      );
      return;
    }

    const scriptSrc =
      "https://challenges.cloudflare.com/turnstile/v0/api.js";
    const existing = document.querySelector(`script[src="${scriptSrc}"]`);

    const handleLoad = () => {
      if (!turnstileRef.current || turnstileWidgetId.current !== null) return;
      turnstileWidgetId.current = window.turnstile.render(
        turnstileRef.current,
        {
          sitekey: turnstileSiteKey,
          callback: (token) => setCaptchaToken(token),
          "expired-callback": () => setCaptchaToken(""),
          "error-callback": () => setCaptchaToken(""),
        }
      );
    };

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
  }, [turnstileSiteKey]);

  return (
    <>
      {/* Header */}
      <Header />

      {/* Breadcrumb */}
      <div className="bg-[#f5f1eb] py-4 px-6 text-sm text-gray-700">
        <div className="max-w-5xl mx-auto flex justify-start items-center gap-2">
          <FiHome className="inline-block w-4 h-4" />
          <Link to="/" className="underline hover:text-gray-800">
            Home
          </Link>
          <span>/</span>
          <span className="text-black font-regular">Forgot Password</span>
        </div>
      </div>

      {/* Form Box */}
      <div className="flex justify-center px-4 mt-10">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-fade-in">
          <h2 className="text-center text-2xl font-semibold mb-2">
            Reset Your Password
          </h2>

          {/* 🔐 small security/ux note */}
          <p className="text-xs text-gray-500 text-center mb-5">
            Enter your account email. If an account exists, we&apos;ll send a
            password reset link. Check your spam folder as well.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-600">
                Email address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0f6b6f] bg-gray-50"
              />
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-medium text-gray-600">
                Verify you are human
              </label>
              <div
                ref={turnstileRef}
                className="rounded-lg border border-gray-200 bg-white p-3"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !captchaToken}
              className="w-full bg-[#0f6b6f] text-white py-3 rounded-md font-medium hover:bg-[#0b5559] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;

