const FALLBACK_TIME_ZONE = "America/New_York";

const isValidTimeZone = (timeZone: string): boolean => {
  try {
    new Intl.DateTimeFormat("en", { timeZone });
    return true;
  } catch {
    return false;
  }
};

const resolveTimeZone = (candidate?: string): string => {
  const detected =
    candidate ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (detected === "" || !isValidTimeZone(detected)) {
    return FALLBACK_TIME_ZONE;
  }
  return detected;
};

export { resolveTimeZone };
