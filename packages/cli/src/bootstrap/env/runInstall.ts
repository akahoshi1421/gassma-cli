import type { PackageManager } from "./detectPackageManager";
import type { ExecFn, ExecResult } from "./execCommand";
import { resolveInstallCommand } from "./installCommand";

const runInstall = (
  exec: ExecFn,
  packageManager: PackageManager,
  cwd: string,
): Promise<ExecResult> => {
  const { command, args } = resolveInstallCommand(packageManager);
  return exec(command, args, { cwd, inherit: true });
};

export { runInstall };
