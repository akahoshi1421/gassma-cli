import type { ResolvedCommand } from "package-manager-detector";
import { resolveCommand } from "package-manager-detector/commands";
import type { PackageManager } from "./detectPackageManager";

const resolveInstallCommand = (
  packageManager: PackageManager,
): ResolvedCommand =>
  resolveCommand(packageManager, "install", []) ?? {
    command: packageManager,
    args: ["install"],
  };

const formatInstallCommand = (packageManager: PackageManager): string => {
  const { command, args } = resolveInstallCommand(packageManager);
  return [command, ...args].join(" ");
};

export { formatInstallCommand, resolveInstallCommand };
