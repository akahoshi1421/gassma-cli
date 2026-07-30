import type { BootstrapTemplates } from "../env/loadBootstrapTemplates";
import type { LinterChoice } from "../linterChoice";

type LinterConfigFile = { fileName: string; content: string };

const LINTER_DEV_DEPENDENCIES: Record<LinterChoice, Record<string, string>> = {
  oxlint: { oxlint: "^1.76.0", oxfmt: "^0.61.0" },
  eslint: {
    eslint: "^10.8.0",
    "eslint-config-prettier": "^10.1.8",
    prettier: "^3.9.6",
    "typescript-eslint": "^8.65.0",
  },
  none: {},
};

const LINTER_SCRIPTS: Record<LinterChoice, Record<string, string>> = {
  oxlint: {
    lint: "oxlint",
    "lint:fix": "oxlint --fix",
    format: "oxfmt",
    "format:check": "oxfmt --check",
  },
  eslint: {
    lint: "eslint .",
    "lint:fix": "eslint . --fix",
    format: "prettier --write .",
    "format:check": "prettier --check .",
  },
  none: {},
};

const linterConfigFiles = (
  linter: LinterChoice,
  templates: BootstrapTemplates,
): LinterConfigFile[] => {
  if (linter === "oxlint") {
    return [{ fileName: ".oxlintrc.json", content: templates.oxlintrc }];
  }
  if (linter === "eslint") {
    return [
      { fileName: "eslint.config.mjs", content: templates.eslintConfig },
      { fileName: ".prettierrc", content: templates.prettierrc },
    ];
  }
  return [];
};

export { LINTER_DEV_DEPENDENCIES, LINTER_SCRIPTS, linterConfigFiles };
export type { LinterConfigFile };
