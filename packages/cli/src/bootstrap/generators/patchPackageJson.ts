import type { FunctionStyle } from "../functionStyle";
import type { LinterChoice } from "../linterChoice";
import { isRecord } from "../util/isRecord";
import { LINTER_DEV_DEPENDENCIES, LINTER_SCRIPTS } from "./linterSetup";

type PatchPackageJsonOptions = {
  name: string;
  gassmaVersion: string;
  style: FunctionStyle;
  linter: LinterChoice;
};

const STYLE_PLUGINS: Record<FunctionStyle, string> = {
  export: "@gassma/gas-esbuild-plugin",
  global: "esbuild-gas-plugin",
};

const pickDevDependencies = (
  value: unknown,
  style: FunctionStyle,
): Record<string, unknown> => {
  if (!isRecord(value)) return {};

  const unused =
    style === "export" ? STYLE_PLUGINS.global : STYLE_PLUGINS.export;
  const picked: Record<string, unknown> = {};
  Object.keys(value).forEach((key) => {
    if (key !== unused) picked[key] = value[key];
  });
  return picked;
};

// npm tooling (oxfmt) expects package.json dependency blocks to be sorted.
const sortByName = (
  record: Record<string, unknown>,
): Record<string, unknown> => {
  const sorted: Record<string, unknown> = {};
  Object.keys(record)
    .sort()
    .forEach((key) => {
      sorted[key] = record[key];
    });
  return sorted;
};

const patchPackageJson = (
  template: string,
  options: PatchPackageJsonOptions,
): Record<string, unknown> => {
  const parsed: unknown = JSON.parse(template);
  if (!isRecord(parsed)) {
    throw new Error("The package.json template is not a JSON object.");
  }

  return {
    ...parsed,
    name: options.name,
    scripts: {
      ...(isRecord(parsed.scripts) ? parsed.scripts : {}),
      ...LINTER_SCRIPTS[options.linter],
    },
    dependencies: {
      ...(isRecord(parsed.dependencies) ? parsed.dependencies : {}),
      gassma: `^${options.gassmaVersion}`,
    },
    devDependencies: sortByName({
      ...pickDevDependencies(parsed.devDependencies, options.style),
      ...LINTER_DEV_DEPENDENCIES[options.linter],
    }),
  };
};

const renderPackageJson = (record: Record<string, unknown>): string =>
  `${JSON.stringify(record, null, 2)}\n`;

export { patchPackageJson, renderPackageJson };
export type { PatchPackageJsonOptions };
