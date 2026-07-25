import { isRecord } from "../util/isRecord";
import { buildPackageJsonObject } from "./generatePackageJson";
import type { GeneratePackageJsonOptions } from "./generatePackageJson";

const mergeSection = (
  generated: Record<string, string>,
  existing: unknown,
): Record<string, unknown> =>
  isRecord(existing) ? { ...generated, ...existing } : { ...generated };

const mergePackageJson = (
  existingText: string,
  options: GeneratePackageJsonOptions,
): string => {
  const existing: unknown = JSON.parse(existingText);
  if (!isRecord(existing)) {
    throw new Error("Existing package.json is not a JSON object.");
  }

  const generated = buildPackageJsonObject(options);
  const merged = {
    ...generated,
    ...existing,
    scripts: mergeSection(generated.scripts, existing.scripts),
    dependencies: mergeSection(generated.dependencies, existing.dependencies),
    devDependencies: mergeSection(
      generated.devDependencies,
      existing.devDependencies,
    ),
  };

  return `${JSON.stringify(merged, null, 2)}\n`;
};

export { mergePackageJson };
