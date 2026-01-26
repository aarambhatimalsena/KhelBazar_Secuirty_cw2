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

export const evaluatePassword = (password, context = {}) => {
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
