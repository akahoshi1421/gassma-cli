import path from "path";
import { resolveTargetDirectory } from "../../env/targetDirectory";
import type { BootstrapContext, BootstrapDeps } from "../context";
import type { BootstrapStep } from "../context";
import { BootstrapCancelledError } from "../prompts";

const DEFAULT_DIRECTORY = "gassma-project";

const confirmNonEmpty = async (
  input: string,
  deps: BootstrapDeps,
): Promise<void> => {
  const proceed = await deps.prompter.confirm(
    `Directory "${input}" is not empty. Continue?`,
    deps.assumeYes,
  );
  if (!proceed) throw new BootstrapCancelledError();
};

const enterDirectory = (
  context: BootstrapContext,
  deps: BootstrapDeps,
  target: string,
  missing: boolean,
): void => {
  if (deps.dryRun) {
    if (!missing) return;
    const relative = path.relative(context.cwd, target);
    deps.plan(`create directory ${relative === "" ? target : relative}`);
    return;
  }
  if (missing) deps.directories.ensure(target);
  deps.directories.changeTo(target);
};

const directoryStep: BootstrapStep = {
  id: "directory",
  run: async (context, deps) => {
    const input =
      deps.directoryArg ??
      (await deps.prompter.text("Project directory?", DEFAULT_DIRECTORY));
    const target = resolveTargetDirectory(context.cwd, input);
    const status = deps.directories.inspect(target);

    if (status === "file") {
      throw new Error(`"${input}" already exists and is not a directory.`);
    }
    if (status === "nonEmpty") await confirmNonEmpty(input, deps);

    enterDirectory(context, deps, target, status === "missing");

    return {
      ...context,
      cwd: target,
      title: path.basename(target) || context.title,
      packageManager: await deps.detectPackageManager(
        status === "missing" ? context.cwd : target,
      ),
    };
  },
};

export { directoryStep };
