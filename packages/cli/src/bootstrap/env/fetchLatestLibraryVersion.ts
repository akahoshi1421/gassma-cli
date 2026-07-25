import { GASSMA_LIBRARY } from "../const/gassmaLibrary";
import { isRecord } from "../util/isRecord";
import type { ExecFn } from "./execCommand";

const collectVersionNumbers = (value: unknown): number[] => {
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectVersionNumbers(item));
  }
  if (!isRecord(value)) return [];

  const own =
    typeof value.versionNumber === "number" ? [value.versionNumber] : [];
  const nested = Array.isArray(value.versions)
    ? collectVersionNumbers(value.versions)
    : [];
  return [...own, ...nested];
};

const parseVersionNumbers = (stdout: string): number[] => {
  try {
    const parsed: unknown = JSON.parse(stdout);
    return collectVersionNumbers(parsed);
  } catch {
    return [];
  }
};

const fetchLatestLibraryVersion = async (exec: ExecFn): Promise<string> => {
  const result = await exec("clasp", [
    "list-versions",
    GASSMA_LIBRARY.scriptId,
    "--json",
  ]);
  if (!result.ok) return GASSMA_LIBRARY.latestVersion;

  const numbers = parseVersionNumbers(result.stdout);
  if (numbers.length === 0) return GASSMA_LIBRARY.latestVersion;

  return String(Math.max(...numbers));
};

export { fetchLatestLibraryVersion };
