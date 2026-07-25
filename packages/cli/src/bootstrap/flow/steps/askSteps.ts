import path from "path";
import { formatInstallCommand } from "../../env/installCommand";
import type { BootstrapStep } from "../context";

const titleStep: BootstrapStep = {
  id: "title",
  run: async (context, deps) => ({
    ...context,
    title: await deps.prompter.text("Project title?", context.title),
  }),
};

const sheetsStep: BootstrapStep = {
  id: "sheets",
  run: async (context, deps) => {
    if (deps.store.exists(path.join(context.cwd, ".clasp.json"))) {
      deps.prompter.info(
        "Found an existing .clasp.json. Skipping clasp create-script.",
      );
      return { ...context, claspCreateSkipped: true };
    }

    const withSheets = await deps.prompter.confirm(
      "Create a new spreadsheet as well?",
      true,
    );
    return { ...context, withSheets };
  },
};

const styleStep: BootstrapStep = {
  id: "style",
  run: async (context, deps) => {
    deps.prompter.note(
      deps.templates.sampleIndex.export.trimEnd(),
      "export style (recommended)",
    );
    deps.prompter.note(
      deps.templates.sampleIndex.global.trimEnd(),
      "global style",
    );

    const style = await deps.prompter.select(
      "Function exposure style?",
      [
        { value: "export", label: "export", hint: "recommended" },
        { value: "global", label: "global", hint: "esbuild-gas-plugin style" },
      ],
      "export",
    );
    return { ...context, style };
  },
};

const sampleStep: BootstrapStep = {
  id: "sample",
  run: async (context, deps) => ({
    ...context,
    wantSample: await deps.prompter.confirm(
      "Generate a sample src/index.ts?",
      true,
    ),
  }),
};

const installPromptStep: BootstrapStep = {
  id: "installPrompt",
  run: async (context, deps) => {
    if (deps.skipInstall) return context;

    const wantInstall = await deps.prompter.confirm(
      `Install dependencies now? (${formatInstallCommand(context.packageManager)})`,
      true,
    );
    return { ...context, wantInstall };
  },
};

export { installPromptStep, sampleStep, sheetsStep, styleStep, titleStep };
