import path from "path";
import type { FileStore } from "./fileStore";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

type DetectPackageManagerOptions = {
  dir: string;
  store: FileStore;
  userAgent?: string;
};

const LOCKFILES: { file: string; packageManager: PackageManager }[] = [
  { file: "pnpm-lock.yaml", packageManager: "pnpm" },
  { file: "yarn.lock", packageManager: "yarn" },
  { file: "bun.lockb", packageManager: "bun" },
  { file: "bun.lock", packageManager: "bun" },
  { file: "package-lock.json", packageManager: "npm" },
];

const USER_AGENT_PREFIXES: {
  prefix: string;
  packageManager: PackageManager;
}[] = [
  { prefix: "pnpm/", packageManager: "pnpm" },
  { prefix: "yarn/", packageManager: "yarn" },
  { prefix: "bun/", packageManager: "bun" },
  { prefix: "npm/", packageManager: "npm" },
];

const fromUserAgent = (userAgent?: string): PackageManager | undefined => {
  if (userAgent === undefined) return undefined;
  return USER_AGENT_PREFIXES.find((entry) => userAgent.startsWith(entry.prefix))
    ?.packageManager;
};

const detectPackageManager = (
  options: DetectPackageManagerOptions,
): PackageManager => {
  const matched = LOCKFILES.find((entry) =>
    options.store.exists(path.join(options.dir, entry.file)),
  );
  if (matched !== undefined) return matched.packageManager;

  return fromUserAgent(options.userAgent) ?? "npm";
};

export { detectPackageManager };
export type { PackageManager };
