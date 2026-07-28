import fs from "fs";
import path from "path";
import { isRecord } from "../bootstrap/util/isRecord";
import { MigrateOutputDirError } from "../error/mainError";

const readClaspRootDir = (cwd: string): string | undefined => {
  const claspJsonPath = path.join(cwd, ".clasp.json");
  if (!fs.existsSync(claspJsonPath)) return undefined;

  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(claspJsonPath, "utf-8"));
    if (!isRecord(parsed)) return undefined;
    return typeof parsed.rootDir === "string" ? parsed.rootDir : undefined;
  } catch {
    return undefined;
  }
};

const resolveOutputDir = (output: string | undefined, cwd: string): string => {
  if (output !== undefined) return output;

  const rootDir = readClaspRootDir(cwd);
  if (rootDir !== undefined) return rootDir;

  throw new MigrateOutputDirError();
};

export { resolveOutputDir };
