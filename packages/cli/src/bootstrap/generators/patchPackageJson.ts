import type { FunctionStyle } from "../functionStyle";
import { isRecord } from "../util/isRecord";

type PatchPackageJsonOptions = {
  name: string;
  gassmaVersion: string;
  style: FunctionStyle;
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
    dependencies: {
      ...(isRecord(parsed.dependencies) ? parsed.dependencies : {}),
      gassma: `^${options.gassmaVersion}`,
    },
    devDependencies: pickDevDependencies(parsed.devDependencies, options.style),
  };
};

const renderPackageJson = (record: Record<string, unknown>): string =>
  `${JSON.stringify(record, null, 2)}\n`;

export { patchPackageJson, renderPackageJson };
export type { PatchPackageJsonOptions };
