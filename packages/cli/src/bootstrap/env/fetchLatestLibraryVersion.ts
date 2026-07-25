import { GASSMA_LIBRARY } from "../const/gassmaLibrary";
import { isRecord } from "../util/isRecord";
import type { ExecFn } from "./execCommand";

type FetchTextFn = (url: string) => Promise<string>;

const GASSMA_PACKAGE_JSON_URL =
  "https://raw.githubusercontent.com/akahoshi1421/gassma/main/package.json";
const FETCH_TIMEOUT_MS = 5000;

const createDefaultFetchText = (): FetchTextFn => async (url) => {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text();
};

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

const fetchVersionFromClasp = async (exec: ExecFn): Promise<string | null> => {
  const result = await exec("clasp", [
    "list-versions",
    GASSMA_LIBRARY.scriptId,
    "--json",
  ]);
  if (!result.ok) return null;

  const numbers = parseVersionNumbers(result.stdout);
  if (numbers.length === 0) return null;

  return String(Math.max(...numbers));
};

const fetchVersionFromGithub = async (
  fetchText: FetchTextFn,
): Promise<string | null> => {
  try {
    const parsed: unknown = JSON.parse(
      await fetchText(GASSMA_PACKAGE_JSON_URL),
    );
    if (!isRecord(parsed)) return null;
    if (typeof parsed.version !== "string" || parsed.version === "") {
      return null;
    }
    return parsed.version;
  } catch {
    return null;
  }
};

const fetchLatestLibraryVersion = async (
  exec: ExecFn,
  fetchText: FetchTextFn,
): Promise<string | null> => {
  const fromClasp = await fetchVersionFromClasp(exec);
  if (fromClasp !== null) return fromClasp;

  return fetchVersionFromGithub(fetchText);
};

export {
  GASSMA_PACKAGE_JSON_URL,
  createDefaultFetchText,
  fetchLatestLibraryVersion,
};
export type { FetchTextFn };
