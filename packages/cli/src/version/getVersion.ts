import fs from "fs";
import path from "path";
import { isRecord } from "../bootstrap/util/isRecord";

const readGassmaVersion = (packageJsonPath: string): string | undefined => {
  if (!fs.existsSync(packageJsonPath)) return undefined;
  try {
    const parsed: unknown = JSON.parse(
      fs.readFileSync(packageJsonPath, "utf-8"),
    );
    if (!isRecord(parsed) || parsed.name !== "gassma") return undefined;
    return typeof parsed.version === "string" ? parsed.version : undefined;
  } catch {
    return undefined;
  }
};

const findGassmaVersion = (startDir: string): string => {
  let dir = path.resolve(startDir);
  const { root } = path.parse(dir);
  let reachedRoot = false;

  while (!reachedRoot) {
    const version = readGassmaVersion(path.join(dir, "package.json"));
    if (version !== undefined) return version;
    reachedRoot = dir === root;
    dir = path.dirname(dir);
  }

  throw new Error(
    `Could not find the gassma package.json above ${startDir}. The CLI installation looks broken.`,
  );
};

const getVersion = (): string => findGassmaVersion(__dirname);

export { findGassmaVersion, getVersion };
