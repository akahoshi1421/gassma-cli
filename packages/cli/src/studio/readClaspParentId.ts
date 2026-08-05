import fs from "fs";
import path from "path";
import { isRecord } from "../bootstrap/util/isRecord";
import { InvalidClaspJsonError } from "../error/mainError";

const toParentId = (value: unknown): string | undefined => {
  if (typeof value === "string") return value === "" ? undefined : value;
  if (!Array.isArray(value)) return undefined;

  const first: unknown = value[0];
  if (typeof first !== "string" || first === "") return undefined;
  return first;
};

const parseClaspJson = (claspJsonPath: string): Record<string, unknown> => {
  const text = fs.readFileSync(claspJsonPath, "utf-8");

  const parsed: unknown = (() => {
    try {
      return JSON.parse(text);
    } catch {
      throw new InvalidClaspJsonError(claspJsonPath);
    }
  })();

  if (!isRecord(parsed)) throw new InvalidClaspJsonError(claspJsonPath);
  return parsed;
};

const readClaspParentId = (cwd: string): string | undefined => {
  const claspJsonPath = path.join(cwd, ".clasp.json");
  if (!fs.existsSync(claspJsonPath)) return undefined;

  return toParentId(parseClaspJson(claspJsonPath).parentId);
};

export { readClaspParentId };
