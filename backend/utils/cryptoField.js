import crypto from "crypto";

const VERSION_PREFIX = "enc:v1";

const getKey = () => {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error("FIELD_ENCRYPTION_KEY is not set");
  }

  let key = null;

  try {
    const buf = Buffer.from(raw, "base64");
    if (buf.length === 32) key = buf;
  } catch {}

  if (!key) {
    const buf = Buffer.from(raw, "hex");
    if (buf.length === 32) key = buf;
  }

  if (!key) {
    throw new Error("FIELD_ENCRYPTION_KEY must be 32 bytes (base64 or hex)");
  }

  return key;
};

export const encryptField = (value) => {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") value = String(value);

  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    VERSION_PREFIX,
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
};

export const decryptField = (value) => {
  if (!value || typeof value !== "string") {
    return { ok: true, value };
  }

  if (!value.startsWith(`${VERSION_PREFIX}:`)) {
    return { ok: true, value };
  }

  try {
    const parts = value.split(":");
    if (parts.length !== 4) {
      return { ok: false, value: null, error: "invalid_format" };
    }

    const key = getKey();
    const iv = Buffer.from(parts[1], "base64");
    const tag = Buffer.from(parts[2], "base64");
    const encrypted = Buffer.from(parts[3], "base64");

    const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString("utf8");

    return { ok: true, value: decrypted };
  } catch (error) {
    return { ok: false, value: null, error: error.message };
  }
};
