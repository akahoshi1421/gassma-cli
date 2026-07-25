import { isRecord } from "../util/isRecord";
import { renderPackageJson } from "./patchPackageJson";

const mergeSection = (
  desired: unknown,
  existing: unknown,
): Record<string, unknown> => ({
  ...(isRecord(desired) ? desired : {}),
  ...(isRecord(existing) ? existing : {}),
});

const mergePackageJson = (
  existingText: string,
  desired: Record<string, unknown>,
): string => {
  const existing: unknown = JSON.parse(existingText);
  if (!isRecord(existing)) {
    throw new Error("Existing package.json is not a JSON object.");
  }

  const merged = {
    ...desired,
    ...existing,
    scripts: mergeSection(desired.scripts, existing.scripts),
    dependencies: mergeSection(desired.dependencies, existing.dependencies),
    devDependencies: mergeSection(
      desired.devDependencies,
      existing.devDependencies,
    ),
  };

  return renderPackageJson(merged);
};

export { mergePackageJson };
