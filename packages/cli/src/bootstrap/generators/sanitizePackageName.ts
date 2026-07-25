const FALLBACK_NAME = "gassma-project";
const MAX_NAME_LENGTH = 214;

const sanitizePackageName = (rawName: string): string => {
  const cleaned = rawName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_.-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_.]+/, "")
    .replace(/-+$/, "");

  if (cleaned === "") return FALLBACK_NAME;
  return cleaned.slice(0, MAX_NAME_LENGTH);
};

export { sanitizePackageName };
