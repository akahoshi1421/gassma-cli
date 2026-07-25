import { detect, getUserAgent } from "package-manager-detector/detect";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

type DetectPackageManagerOptions = {
  cwd: string;
  userAgent?: string;
};

const PACKAGE_MANAGERS: readonly PackageManager[] = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
];

const toPackageManager = (
  name: string | undefined,
): PackageManager | undefined =>
  PACKAGE_MANAGERS.find((packageManager) => packageManager === name);

const fromUserAgent = (
  userAgent: string | undefined,
): PackageManager | undefined => {
  if (userAgent === undefined)
    return toPackageManager(getUserAgent() ?? undefined);
  return toPackageManager(userAgent.split("/")[0]);
};

const detectPackageManager = async (
  options: DetectPackageManagerOptions,
): Promise<PackageManager> => {
  const detected = await detect({ cwd: options.cwd });
  return (
    toPackageManager(detected?.name) ??
    fromUserAgent(options.userAgent) ??
    "npm"
  );
};

export { detectPackageManager };
export type { PackageManager };
