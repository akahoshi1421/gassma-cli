import path from "path";
import type { PackageManager } from "../env/detectPackageManager";
import type { ExecFn } from "../env/execCommand";
import type { FetchTextFn } from "../env/fetchLatestLibraryVersion";
import type { FileStore } from "../env/fileStore";
import type { BootstrapTemplates } from "../env/loadBootstrapTemplates";
import type { DirectoryOps } from "../env/targetDirectory";
import type { FunctionStyle } from "../functionStyle";
import type { LinterChoice } from "../linterChoice";
import type { Prompter } from "./prompts";

type BootstrapContext = {
  cwd: string;
  title: string;
  withSheets: boolean;
  style: FunctionStyle;
  linter: LinterChoice;
  wantSample: boolean;
  wantInstall: boolean;
  packageManager: PackageManager;
  libraryVersion: string | null;
  claspCreateSkipped: boolean;
};

type BootstrapDeps = {
  prompter: Prompter;
  store: FileStore;
  exec: ExecFn;
  fetchText: FetchTextFn;
  plan: (action: string) => void;
  plannedActions: readonly string[];
  dryRun: boolean;
  skipInstall: boolean;
  assumeYes: boolean;
  directoryArg?: string;
  directories: DirectoryOps;
  detectPackageManager: (cwd: string) => Promise<PackageManager>;
  gassmaVersion: string;
  templates: BootstrapTemplates;
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
  linter: "oxlint",
  wantSample: true,
  wantInstall: true,
  packageManager: options.packageManager,
  libraryVersion: null,
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
