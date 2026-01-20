import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// 🔐 Brute-force config: 10 attempts, 5-minute lock
const LOGIN_MAX_ATTEMPTS = 5; // 5 tries
const LOGIN_LOCK_TIME_MIN = 15; // lock for 15 minutes
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 32;
const COMMON_PASSWORDS = new Set([
  "123456",
  "1234567",
  "12345678",
  "123456789",
  "1234567890",
  "123123",
  "111111",
  "000000",
  "qwerty",
  "qwertyuiop",
  "asdfgh",
  "zxcvbn",
  "password",
  "passw0rd",
  "letmein",
  "welcome",
  "admin",
  "login",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "abc123",
  "test",
  "test123",
  "test@123",
]);
const COMMON_SUBSTRINGS = [
  "password",
  "passw0rd",
  "qwerty",
  "asdf",
  "zxcv",
  "1234",
  "abcd",
  "admin",
  "letmein",
  "welcome",
  "iloveyou",
  "monkey",
  "dragon",
  "football",
  "baseball",
  "abc123",
  "test",
];
const SEQUENCES = [
  "0123456789",
  "abcdefghijklmnopqrstuvwxyz",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

const normalize = (value) => (value || "").toLowerCase();
const extractTokens = (value) =>
  normalize(value)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);

const hasSequence = (passwordLower) => {
  for (const seq of SEQUENCES) {
    for (let i = 0; i <= seq.length - 4; i += 1) {
      const chunk = seq.slice(i, i + 4);
      if (passwordLower.includes(chunk)) return true;
    }
    const reversed = seq.split("").reverse().join("");
    for (let i = 0; i <= reversed.length - 4; i += 1) {
      const chunk = reversed.slice(i, i + 4);
      if (passwordLower.includes(chunk)) return true;
    }
  }
  return false;
};

const hasRepeatedChars = (value) => /(.)\1{3,}/.test(value);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: function () {
        return !this.isOtpUser && !this.isGoogleUser;
      },
      minlength: PASSWORD_MIN_LENGTH,
    },

    // password reuse + expiry
    passwordHistory: {
      type: [String],
      default: [], // store last 5 bcrypt hashes
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },

    isOtpUser: {
      type: Boolean,
      default: false,
    },

    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ✅ Account control
    isActive: {
      type: Boolean,
      default: true, // admin can soft-disable later
    },

    resetPasswordToken: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },

    //  Brute-force protection
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },

    // ✅ Login tracking (for suspicious login detection)
    lastLoginAt: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    lastLoginUserAgent: {
      type: String,
    },

    // ✅ Device fingerprint + location info (ADVANCED)
    lastLoginDeviceHash: {
      type: String,
    },
    lastLoginCountry: {
      type: String,
    },
    lastLoginCity: {
      type: String,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    // ✅ Suspicious login tracking
    loginHistory: [
      {
        ip: String,
        userAgent: String,
        deviceHash: String,
        country: String,
        city: String,
        time: Date,
        suspicious: { type: Boolean, default: false },
        reason: String,
        riskScore: Number,
      },
    ],

    // ✅ Suspicious stats for auto-lock
    suspiciousLoginCount: {
      type: Number,
      default: 0,
    },
    lastSuspiciousAt: {
      type: Date,
    },

    flaggedForReview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ?. Strong password policy helper
userSchema.statics.evaluatePassword = function (password, context = {}) {
  if (!password || typeof password !== "string") {
    return { ok: false, label: "Weak", reason: "Password is required." };
  }

  const length = password.length;
  if (length < PASSWORD_MIN_LENGTH || length > PASSWORD_MAX_LENGTH) {
    return {
      ok: false,
      label: "Weak",
      reason: `Password must be ${PASSWORD_MIN_LENGTH}-${PASSWORD_MAX_LENGTH} characters.`,
    };
  }

  const passwordLower = normalize(password);
  if (COMMON_PASSWORDS.has(passwordLower)) {
    return {
      ok: false,
      label: "Weak",
      reason: "Password is too common or easy to guess.",
    };
  }

  if (COMMON_SUBSTRINGS.some((word) => passwordLower.includes(word))) {
    return {
      ok: false,
      label: "Weak",
      reason: "Password is too common or easy to guess.",
    };
  }

  if (hasSequence(passwordLower) || hasRepeatedChars(password)) {
    return {
      ok: false,
      label: "Weak",
      reason: "Password is too easy to guess.",
    };
  }

  const nameTokens = extractTokens(context.name);
  const emailTokens = extractTokens(
    context.email ? context.email.split("@")[0] : ""
  );
  const blockedTokens = [...nameTokens, ...emailTokens];

  if (
    blockedTokens.length > 0 &&
    blockedTokens.some((token) => passwordLower.includes(token))
  ) {
    return {
      ok: false,
      label: "Weak",
      reason: "Password should not contain your name or email.",
    };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const categories = [hasLower, hasUpper, hasNumber, hasSpecial].filter(
    Boolean
  ).length;

  let score = 0;
  if (length >= 10) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 20) score += 1;
  score += categories;
  if (categories >= 3) score += 1;
  if (categories === 4 && length >= 12) score += 1;

  const label = score >= 7 ? "Strong" : score >= 5 ? "Medium" : "Weak";
  if (label === "Weak") {
    return {
      ok: false,
      label,
      reason: "Password is too weak. Use a longer, more unique passphrase.",
    };
  }

  return { ok: true, label, score };
};

userSchema.statics.isPasswordStrong = function (password, context = {}) {
  return this.evaluatePassword(password, context).ok;
};
// Hash password before saving + store OLD hash in history + update passwordChangedAt
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  if (!this.isNew) {
    const existingUser = await this.constructor
      .findById(this._id)
      .select("password passwordHistory");

    if (existingUser?.password && existingUser.password.startsWith("$2")) {
      this.passwordHistory = [
        existingUser.password,
        ...(existingUser.passwordHistory || []),
      ].slice(0, 5); // keep last 5
    }
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  // password expiry tracking
  this.passwordChangedAt = new Date();

  next();
});

// ✅ Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Check if new password is reused (current + last 5)
userSchema.methods.isPasswordReused = async function (newPassword) {
  // check current password
  if (this.password && (await bcrypt.compare(newPassword, this.password))) return true;

  // check history
  for (const oldHash of this.passwordHistory || []) {
    if (await bcrypt.compare(newPassword, oldHash)) return true;
  }

  return false;
};

// Password expiry check (90 days)
userSchema.methods.isPasswordExpired = function () {
  if (!this.passwordChangedAt) return false;

  const MAX_AGE_DAYS = 90;
  const ageMs = Date.now() - this.passwordChangedAt.getTime();

  return ageMs > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
};

// ✅ Is account currently locked?
userSchema.methods.isLocked = function () {
  if (!this.lockUntil) return false;
  return this.lockUntil > new Date();
};

// ✅ Register failed login attempt (use config at top)
userSchema.methods.registerFailedLogin = async function () {
  this.loginAttempts += 1;
  let lockedNow = false;

  if (this.loginAttempts >= LOGIN_MAX_ATTEMPTS) {
    const lock = new Date();
    lock.setMinutes(lock.getMinutes() + LOGIN_LOCK_TIME_MIN);
    this.lockUntil = lock;
    this.loginAttempts = 0; // optional: reset counter once locked
    lockedNow = true;
  }

  await this.save();
  return { lockedNow, lockUntil: this.lockUntil };
};

// ✅ On successful login, reset attempts + lock + update last login info
userSchema.methods.registerSuccessfulLogin = async function (ip, userAgent) {
  this.loginAttempts = 0;
  this.lockUntil = null;
  this.lastLoginAt = new Date();
  this.lastLoginIp = ip || this.lastLoginIp;
  this.lastLoginUserAgent = userAgent || this.lastLoginUserAgent;
  await this.save();
};

// ✅ Register a suspicious login (for auto-locking / analytics)
userSchema.methods.registerSuspiciousLogin = async function () {
  this.suspiciousLoginCount = (this.suspiciousLoginCount || 0) + 1;
  this.lastSuspiciousAt = new Date();

  // Example policy: 3 suspicious logins within 1 hour => 30 min hard lock
  const ONE_HOUR = 60 * 60 * 1000;

  if (this.suspiciousLoginCount >= 3 && this.lastSuspiciousAt) {
    const cutoff = Date.now() - ONE_HOUR;

    if (this.lastSuspiciousAt.getTime() >= cutoff) {
      const lock = new Date();
      lock.setMinutes(lock.getMinutes() + 30);
      this.lockUntil = lock;
      this.flaggedForReview = true;
    }
  }

  await this.save();
};

// ✅ Reset suspicious stats on clean login
userSchema.methods.resetSuspiciousStats = async function () {
  this.suspiciousLoginCount = 0;
  this.lastSuspiciousAt = null;
  await this.save();
};

const User = mongoose.model("User", userSchema);
export default User;

