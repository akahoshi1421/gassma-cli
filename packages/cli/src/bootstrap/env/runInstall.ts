import type { PackageManager } from "./detectPackageManager";
import type { ExecFn, ExecResult } from "./execCommand";

const runInstall = (
  exec: ExecFn,
  packageManager: PackageManager,
  cwd: string,
): Promise<ExecResult> =>
  exec(packageManager, ["install"], { cwd, inherit: true });

export { runInstall };
