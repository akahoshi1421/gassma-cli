import fs from "fs";
import path from "path";
import { isRecord } from "../bootstrap/util/isRecord";

type PackageRoot = {
  dir: string;
  version: string;
};

const readGassmaPackage = (dir: string): PackageRoot | undefined => {
  const packageJsonPath = path.join(dir, "package.json");
  if (!fs.existsSync(packageJsonPath)) return undefined;
  try {
    const parsed: unknown = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf-8"),
    );
    if (!isRecord(parsed) || parsed.name !== "gassma") return undefined;
    if (typeof parsed.version !== "string") return undefined;
    return { dir, version: parsed.version };
  } catch {
    return undefined;
  }
};

const findPackageRoot = (startDir: string): PackageRoot | undefined => {
  let dir = path.resolve(startDir);
  const { root } = path.parse(dir);
  let reachedRoot = false;

  while (!reachedRoot) {
    const found = readGassmaPackage(dir);
    if (found !== undefined) return found;
    reachedRoot = dir === root;
    dir = path.dirname(dir);
  }

  return undefined;
};

export { findPackageRoot };
export type { PackageRoot };
