export const sanitizeText = (value, maxLen) => {
  if (typeof value !== "string") {
    return { value, modified: false };
  }

  const original = value;
  let cleaned = value.replace(/<[^>]*>/g, "");
  cleaned = cleaned.replace(/\s+/g, " ").trim();

  if (typeof maxLen === "number" && maxLen > 0) {
    cleaned = cleaned.slice(0, maxLen);
  }

  return {
    value: cleaned,
    modified: cleaned !== original,
  };
};
