import path from "path";
import { GASSMA_LIBRARY } from "../const/gassmaLibrary";
import type { PackageManager } from "../env/detectPackageManager";
import type { ExecFn } from "../env/execCommand";
import type { FileStore } from "../env/fileStore";
import type { FunctionStyle } from "../functionStyle";
import type { Prompter } from "./prompts";

type BootstrapContext = {
  cwd: string;
  title: string;
  withSheets: boolean;
  style: FunctionStyle;
  wantSample: boolean;
  wantInstall: boolean;
  packageManager: PackageManager;
  libraryVersion: string;
  claspCreateSkipped: boolean;
};

type BootstrapDeps = {
  prompter: Prompter;
  store: FileStore;
  exec: ExecFn;
  plan: (action: string) => void;
  plannedActions: readonly string[];
  dryRun: boolean;
  skipInstall: boolean;
  gassmaVersion: string;
};

type BootstrapStep = {
  id: string;
  run: (
    context: BootstrapContext,
    deps: BootstrapDeps,
  ) => Promise<BootstrapContext>;
};

type InitialContextOptions = {
  cwd: string;
  packageManager: PackageManager;
};

const createInitialContext = (
  options: InitialContextOptions,
): BootstrapContext => ({
  cwd: options.cwd,
  title: path.basename(options.cwd) || "gassma-project",
  withSheets: true,
  style: "export",
  wantSample: true,
  wantInstall: true,
  packageManager: options.packageManager,
  libraryVersion: GASSMA_LIBRARY.latestVersion,
  claspCreateSkipped: false,
});

const runSteps = async (
  steps: readonly BootstrapStep[],
  initial: BootstrapContext,
  deps: BootstrapDeps,
): Promise<BootstrapContext> => {
  let context = initial;
  for (let i = 0; i < steps.length; i += 1) {
    context = await steps[i].run(context, deps);
  }
  return context;
};

export { createInitialContext, runSteps };
export type { BootstrapContext, BootstrapDeps, BootstrapStep };
