import fs from "fs";
import path from "path";
import { GASSMA_LIBRARY } from "../bootstrap/const/gassmaLibrary";
import { isRecord } from "../bootstrap/util/isRecord";

const readLibraries = (manifest: Record<string, unknown>): unknown[] => {
  const dependencies = manifest.dependencies;
  if (!isRecord(dependencies)) return [];
  return Array.isArray(dependencies.libraries) ? dependencies.libraries : [];
};

const findGassmaUserSymbol = (manifest: unknown): string | undefined => {
  if (!isRecord(manifest)) return undefined;

  const entry = readLibraries(manifest)
    .filter(isRecord)
    .find((library) => library.libraryId === GASSMA_LIBRARY.scriptId);
  if (entry === undefined) return undefined;

  return typeof entry.userSymbol === "string" ? entry.userSymbol : undefined;
};

const resolveUserSymbol = (outputDir: string): string => {
  const manifestPath = path.join(outputDir, "appsscript.json");
  if (!fs.existsSync(manifestPath)) return GASSMA_LIBRARY.userSymbol;

  try {
    const manifest: unknown = JSON.parse(
      fs.readFileSync(manifestPath, "utf-8"),
    );
    return findGassmaUserSymbol(manifest) ?? GASSMA_LIBRARY.userSymbol;
  } catch {
    return GASSMA_LIBRARY.userSymbol;
  }
};

export { resolveUserSymbol };
