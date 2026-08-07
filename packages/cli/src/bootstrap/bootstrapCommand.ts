import { getVersion } from "../version/getVersion";
import { checkClaspAvailable } from "./env/checkClaspAvailable";
import { detectPackageManager } from "./env/detectPackageManager";
import { createDefaultExec } from "./env/execCommand";
import type { ExecFn } from "./env/execCommand";
import { createFsFileStore } from "./env/fileStore";
import { loadBootstrapTemplates } from "./env/loadBootstrapTemplates";
import { createDirectoryOps } from "./env/targetDirectory";
import { buildBootstrapSteps } from "./flow/buildSteps";
import { createInitialContext, runSteps } from "./flow/context";
import type { BootstrapDeps } from "./flow/context";
import { createDryEnv, createRealEnv } from "./flow/io";
import {
  BootstrapCancelledError,
  createAutoPrompter,
  createClackPrompter,
  createDryRunPrompter,
} from "./flow/prompts";
import type { Prompter } from "./flow/prompts";

type BootstrapOptions = {
  directory?: string;
  yes?: boolean;
  skipInstall?: boolean;
  dryRun?: boolean;
};

type BootstrapOverrides = {
  exec?: ExecFn;
  prompter?: Prompter;
  isTty?: boolean;
  userAgent?: string;
};

const CLASP_MISSING_MESSAGE = [
  "clasp is required but was not found in your PATH.",
  "Install it with: npm install -g @google/clasp",
  "Then log in with: clasp login",
].join("\n");

const handleBootstrapError = (error: unknown, prompter: Prompter): void => {
  if (error instanceof BootstrapCancelledError) {
    prompter.warn("Bootstrap cancelled.");
    process.exitCode = 1;
    return;
  }
  const message = error instanceof Error ? error.message : String(error);
  prompter.warn(`Bootstrap failed. ${message}`);
  process.exitCode = 1;
};

const bootstrap = async (
  options: BootstrapOptions = {},
  overrides: BootstrapOverrides = {},
): Promise<void> => {
  const yes = options.yes === true;
  const dryRun = options.dryRun === true;
  const isTty =
    overrides.isTty ??
    (process.stdin.isTTY === true && process.stdout.isTTY === true);

  if (!yes && !isTty) {
    console.error(
      "An interactive terminal is required. Run with --yes for non-interactive mode.",
    );
    process.exitCode = 1;
    return;
  }

  const baseExec = overrides.exec ?? createDefaultExec();
  if (!dryRun && !(await checkClaspAvailable(baseExec))) {
    console.error(CLASP_MISSING_MESSAGE);
    process.exitCode = 1;
    return;
  }

  const cwd = process.cwd();
  const realStore = createFsFileStore();
  const env = dryRun
    ? createDryEnv(realStore, cwd)
    : createRealEnv(realStore, baseExec);
  const basePrompter =
    overrides.prompter ?? (yes ? createAutoPrompter() : createClackPrompter());
  const prompter = dryRun ? createDryRunPrompter(basePrompter) : basePrompter;

  const deps: BootstrapDeps = {
    prompter,
    store: env.store,
    exec: env.exec,
    plan: env.plan,
    plannedActions: env.plannedActions,
    dryRun,
    skipInstall: options.skipInstall === true,
    assumeYes: yes,
    directoryArg: options.directory,
    directories: createDirectoryOps(),
    detectPackageManager: (directory) =>
      detectPackageManager({ cwd: directory, userAgent: overrides.userAgent }),
    gassmaVersion: getVersion(),
    templates: loadBootstrapTemplates(),
  };
  const initialContext = createInitialContext({ cwd, packageManager: "npm" });

  prompter.intro("gassma bootstrap");
  try {
    await runSteps(buildBootstrapSteps(), initialContext, deps);
  } catch (error) {
    handleBootstrapError(error, prompter);
  }
};

export { bootstrap };
export type { BootstrapOptions, BootstrapOverrides };
