import { runInstall } from "../../env/runInstall";
import type {
  BootstrapContext,
  BootstrapDeps,
  BootstrapStep,
} from "../context";

const installRunStep: BootstrapStep = {
  id: "installRun",
  run: async (context, deps) => {
    const manualCommand = `${context.packageManager} install`;

    if (deps.skipInstall) {
      deps.prompter.info(
        `Skipping dependency installation. Run "${manualCommand}" manually.`,
      );
      return context;
    }
    if (!context.wantInstall) {
      deps.prompter.info(
        `Dependencies were not installed. Run "${manualCommand}" when you are ready.`,
      );
      return context;
    }

    deps.prompter.info(`Installing dependencies with "${manualCommand}"...`);
    const result = await runInstall(
      deps.exec,
      context.packageManager,
      context.cwd,
    );
    if (!result.ok) {
      deps.prompter.warn(
        `Dependency installation failed. Run "${manualCommand}" manually.`,
      );
    }
    return context;
  },
};

const buildNextStepsMessage = (
  context: BootstrapContext,
  deps: BootstrapDeps,
): string => {
  const packageManager = context.packageManager;
  const installLine =
    deps.skipInstall || !context.wantInstall
      ? [`Run "${packageManager} install" to install dependencies`]
      : [];

  const lines = [
    ...installLine,
    "Edit gassma/schema.prisma to define your models",
    'Run "npx gassma generate" to generate the typed client',
    `Run "${packageManager} run deploy" to build and push to Apps Script`,
    'Run "npx clasp open" to open the project in the Apps Script editor',
  ];
  const numbered = lines.map((line, index) => `${index + 1}. ${line}`);

  return [
    ...numbered,
    "",
    "Note: .clasp.json is gitignored. Restore it from your team's secret store when sharing this project.",
  ].join("\n");
};

const nextStepsStep: BootstrapStep = {
  id: "nextSteps",
  run: (context, deps) => {
    if (deps.dryRun) {
      const actions = deps.plannedActions
        .map((action) => `- ${action}`)
        .join("\n");
      deps.prompter.note(
        actions === "" ? "(nothing to do)" : actions,
        "Planned actions (dry run)",
      );
      deps.prompter.outro("Dry run complete. No changes were made.");
      return Promise.resolve(context);
    }

    deps.prompter.note(buildNextStepsMessage(context, deps), "Next steps");
    deps.prompter.outro("Bootstrap complete!");
    return Promise.resolve(context);
  },
};

export { installRunStep, nextStepsStep };
