import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { registerUserService } from "../../services/authService";
import InlineAlert from "../common/InlineAlert";
import { evaluatePassword } from "../../utils/passwordPolicy";

const RegisterForm = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Simple email format check (frontend side)
  const isValidEmailFormat = (value) => /\S+@\S+\.\S+/.test(value.trim());
  const emailInvalid = email && !isValidEmailFormat(email);

  // dY"? Live email availability check (only if format is valid)
  useEffect(() => {
    const checkEmail = async () => {
      if (!email || !isValidEmailFormat(email)) {
        setEmailAvailable(null);
        return;
      }
      try {
        const res = await fetch("http://localhost:5000/api/users/check-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        setEmailAvailable(data.available);
      } catch {
        setEmailAvailable(false);
      }
    };
    const timeout = setTimeout(checkEmail, 800);
    return () => clearTimeout(timeout);
  }, [email]);

  const passwordEval = evaluatePassword(password, { name, email });
  const strength = passwordEval.label;

  const handlePasswordRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return showToast("error", "Passwords do not match");
    }

    if (!agreed) {
      return showToast("error", "You must agree to the terms");
    }

    if (!passwordEval.ok) {
      return showToast("error", passwordEval.reason);
    }

    setSubmitting(true);

    try {
      await registerUserService({ name, email, password });
      showToast("success", "Registered successfully! Check your email.");
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch (err) {
      const data = err.response?.data;

      // express-validator style errors array
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => showToast("error", e.msg));
      } else {
        const backendMsg =
          data?.message || "Register failed. Please check your details.";
        showToast("error", backendMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const baseInput =
    "w-full rounded-xl px-4 py-3 text-sm border bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-[#0f6b6f] focus:border-transparent transition-all";

  const inputClass = `${baseInput} border-gray-200`;

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in">
      {/* Card */}
      <div className="rounded-2xl border border-gray-100 shadow-[0_18px_45px_rgba(15,23,42,0.08)] bg-white/80 backdrop-blur-sm p-6 sm:p-7">
        <form
          onSubmit={handlePasswordRegister}
          className="space-y-4"
          autoComplete="on"
        >
          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 tracking-wide">
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Aarambha Timalsena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputClass}
              autoComplete="name"
              disabled={submitting}
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600 tracking-wide">
                Email Address
              </label>
              <span className="text-[11px] text-gray-400">
                Use your active email
              </span>
            </div>
            <div className="relative">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={`${inputClass} ${
                  emailInvalid ? "border-red-300 focus:ring-red-400" : ""
                }`}
                autoComplete="email"
                disabled={submitting}
              />
              {email && (
                <span
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] px-2 py-0.5 rounded-full border ${
                    emailInvalid
                      ? "border-red-200 bg-red-50 text-teal-700"
                      : emailAvailable
                      ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                      : emailAvailable === false
                      ? "border-amber-200 bg-amber-50 text-amber-600"
                      : "border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {emailInvalid
                    ? "Invalid"
                    : emailAvailable === null
                    ? "Checking..."
                    : emailAvailable
                    ? "Available"
                    : "Taken"}
                </span>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClass}
                autoComplete="new-password"
                disabled={submitting}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
                disabled={submitting}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            {/* Strength indicator */}
            {password && (
              <div className="flex items-center justify-between mt-1">
                <p className="text-[11px] text-gray-500">
                  Strength:{" "}
                  <span
                    className={`font-semibold ${
                      strength === "Strong"
                        ? "text-emerald-600"
                        : strength === "Medium"
                        ? "text-amber-500"
                        : "text-red-500"
                    }`}
                  >
                    {strength}
                  </span>
                </p>
                <div className="flex gap-1 items-center">
                  <span
                    className={`h-1.5 w-8 rounded-full ${
                      strength === "Weak"
                        ? "bg-red-400"
                        : "bg-emerald-500"
                    }`}
                  />
                  <span
                    className={`h-1.5 w-8 rounded-full ${
                      strength === "Strong"
                        ? "bg-emerald-500"
                        : strength === "Medium"
                        ? "bg-amber-400"
                        : "bg-gray-200"
                    }`}
                  />
                  <span
                    className={`h-1.5 w-8 rounded-full ${
                      strength === "Strong" ? "bg-emerald-500" : "bg-gray-200"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Requirements (match backend policy) */}
            <p className="text-[11px] mt-1 text-gray-400 leading-snug">
              Use 8-32 characters, avoid common words/sequences, and make it
              longer for better security.
            </p>
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600 tracking-wide">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={inputClass}
              autoComplete="new-password"
              disabled={submitting}
            />
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 pt-1">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-300 text-[#0f6b6f] focus:ring-[#0f6b6f]"
              disabled={submitting}
            />
            <p className="text-xs text-gray-600 leading-relaxed">
              I agree to the{" "}
              <span className="text-[#0f6b6f] font-medium cursor-pointer hover:underline">
                terms & conditions
              </span>{" "}
              and understand how my data is secured.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-2 w-full bg-[#0f6b6f] text-white font-semibold py-3 rounded-xl shadow-sm hover:bg-[#0b5559] hover:shadow-md active:scale-[0.99] transition-all disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Signing you up..." : "Sign up"}
          </button>
        </form>

        {/* Footer link */}
        <div className="text-center text-sm mt-6">
          <span className="text-gray-500">Already have an account? </span>
          <Link
            to="/login"
            className="text-[#0f6b6f] font-medium hover:underline"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
